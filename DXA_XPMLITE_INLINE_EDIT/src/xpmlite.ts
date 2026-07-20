import { AuthService } from "./auth";
import { ApiClient } from "./apiClient";
import { Media } from "./media";

declare var tinymce: any;

export class Xpmlite {

  private auth: AuthService;
  private api: ApiClient;
  private media: Media;

  private pageLoader: HTMLElement | null;
  private loader: HTMLElement | null;
  private config: any

  constructor(authInstance: AuthService, apiInstance: ApiClient, mediaInstance: Media) {
    this.auth = authInstance;
    this.api = apiInstance;
    this.media = mediaInstance;

    this.pageLoader = document.querySelector(".page-loader");
    this.loader = document.querySelector(".loader")
    this.config = typeof getConfig === "function" ? getConfig() : {};
    //this.media = typeof Media === "function" ? new Media() : null;
    this.initEventDelegation();
  }

  private async getTargetPublicationId(componentId: string): Promise<string> {
    const response = await this.api.getRequest(`/items/${componentId}?useDynamicVersion=true`);
    if (response?.BluePrintInfo?.IsShared) {
      return response.BluePrintInfo.PrimaryBluePrintParentItem.IdRef;
    }
    return componentId;
  }

  private async updateComponent(tcmid: string, targetElement: Element, indexPosition: string | null): Promise<void> {
    const inputField = targetElement.closest("[data-fieldname]");
    if (!inputField) return;
    inputField.classList.remove("xpm-active-field")
    let tagName = "";
    let inputValue = "";

    const textInput = inputField.querySelector("input[type=text]") as HTMLInputElement | null;
    const textareaInput = inputField.querySelector('textarea') as HTMLTextAreaElement | null;

    if (textInput?.getAttribute("name")) {
      tagName = textInput.getAttribute("name") as string;
      inputValue = textInput.value;
      inputField.innerHTML = inputValue;
    } else if (textareaInput?.getAttribute("name")) {
      tagName = textareaInput.getAttribute("name") as string;

      const editorId = textareaInput.id;
      const targetEditor = tinymce.get(editorId);

      inputValue = targetEditor ? targetEditor.getContent() : textareaInput.value;

      if (targetEditor) {
        tinymce.execCommand('mceRemoveEditor', false, editorId);
      }

      inputField.innerHTML = inputValue;
    }

    if (this.loader) this.loader.style.display = "block";
    if (this.pageLoader) this.pageLoader.style.display = "block";

    const targetPublicationId = await this.getTargetPublicationId(tcmid);
    const id = targetPublicationId.split(":").join("_");
    const checkoutResponse = await this.api.postService(`/items/${id}/checkOut`, {});

    if (checkoutResponse) {
      if (checkoutResponse.Content[tagName] !== undefined && checkoutResponse.Content[tagName] !== "$type") {
        checkoutResponse.Content[tagName] = inputValue;
      } else if (checkoutResponse.Content[tagName] === undefined) {
        for (const item in checkoutResponse.Content) {
          const fieldContent = checkoutResponse.Content[item];
          const numIndex = indexPosition ? parseInt(indexPosition, 10) : -1;
          if (fieldContent !== null && numIndex !== -1 && fieldContent[numIndex] !== undefined) {
            if (Object.prototype.hasOwnProperty.call(fieldContent[numIndex], tagName)) {
              fieldContent[numIndex][tagName] = inputValue;
            }
          } else if (fieldContent !== null && Object.prototype.hasOwnProperty.call(fieldContent, tagName)) {
            fieldContent[tagName] = inputValue;
          }
        }
      }

      const updateResponse = await this.api.putService(`/items/${id}`, checkoutResponse);
      if (updateResponse) {
        const componentid = updateResponse.Id.replace(":", "_");
        const checkInResponse = await this.api.postService(`/items/${componentid}/checkIn`, { "RemovePermanentLock": true });
        if (checkInResponse) {
          if (this.loader) this.loader.style.display = "none";
          if (this.pageLoader) this.pageLoader.style.display = "none";
        }
      }
    }
  }

  loginStatus(): void {
    const inputFields = document.querySelectorAll<HTMLElement>("[data-fieldname]");
    this.disableEditor(inputFields);
    if (document.cookie && document.cookie.includes("access_token")) {
      const token = this.auth ? this.auth.getCookie("access_token") : null;
      if (token) {
        this.enableEditor(inputFields)
        this.addComponentEditorLink();
        this.addRegionHighlight();
        this.addComponentHighlight();
        this.addFieldNameHighlight();
      };
    }
  }

  private addFieldNameHighlight(): void {
    if (!document.getElementById("xpm-field-highlight-style")) {
      const style = document.createElement("style");
      style.id = "xpm-field-highlight-style";
      style.textContent = `
      .activeEditor:hover {
        outline: 2px solid #007373 !important;
        outline-offset: -2px;
        transition: all 0.5s;
        cursor: pointer;
        border-radius: 4px;
      }`;

      document.head.appendChild(style);
    }
  }

  private addComponentEditorLink(): void {

    if (!document.getElementById("xpm-component-editor-style")) {
      const style = document.createElement("style");
      style.id = "xpm-component-editor-style";
      style.textContent = `
      .xpm-component-editor-link {
        position: absolute !important;
        top: 0 !important;
        right: 0 !important;
        width: 28px !important;
        height: 28px !important;
        display: none;
        align-items: center;
        justify-content: center;
        background: #007373;
        color: #fff;
        border-radius: 4px;
        z-index: 2147483647 !important;
        cursor: pointer;
        text-decoration: none;
        box-sizing: border-box;
      }

      [data-component-id]:hover > .xpm-component-editor-link {
        display: flex;
      }
      .xpm-component-editor-link:hover,.xpm-component-editor-link svg:hover{
        color:#fff;
      }
    `;

      document.head.appendChild(style);
    }

    const componentLinks = document.querySelectorAll<HTMLElement>("[data-component-id]");

    componentLinks.forEach(item => {
      if (item.querySelector(".xpm-component-editor-link")) {
        return;
      }

      const compId = item.dataset.componentId;
      if (!compId) {
        return;
      }

      if (getComputedStyle(item).position === "static") {
        item.style.position = "relative";
      }

      const link = document.createElement("a");
      link.className = "xpm-component-editor-link";
      link.target = "_blank";
      link.title = compId;
      link.href = `${this.config.experience_space_url}/component?item=${encodeURIComponent(compId)}`;

      link.innerHTML = `
      <svg viewBox="64 64 896 896" width="16" height="16" fill="currentColor" aria-hidden="true">
        <path d="M574 665.4a8.03 8.03 0 00-11.3 0L446.5 781.6c-53.8 53.8-144.6 59.5-204 0-59.5-59.5-53.8-150.2 0-204l116.2-116.2c3.1-3.1 3.1-8.2 0-11.3l-39.8-39.8a8.03 8.03 0 00-11.3 0L191.4 526.5c-84.6 84.6-84.6 221.5 0 306s221.5 84.6 306 0l116.2-116.2c3.1-3.1 3.1-8.2 0-11.3L574 665.4zm258.6-474c-84.6-84.6-221.5-84.6-306 0L410.3 307.6a8.03 8.03 0 000 11.3l39.7 39.7c3.1 3.1 8.2 3.1 11.3 0l116.2-116.2c53.8-53.8 144.6-59.5 204 0 59.5 59.5 53.8 150.2 0 204L665.3 562.6a8.03 8.03 0 000 11.3l39.8 39.8c3.1 3.1 8.2 3.1 11.3 0l116.2-116.2c84.5-84.6 84.5-221.5 0-306.1zM610.1 372.3a8.03 8.03 0 00-11.3 0L372.3 598.7a8.03 8.03 0 000 11.3l39.6 39.6c3.1 3.1 8.2 3.1 11.3 0l226.4-226.4c3.1-3.1 3.1-8.2 0-11.3l-39.5-39.6z"/>
      </svg>
    `;

      item.appendChild(link);
    });
  }

  private addRegionHighlight(): void {
    if (!document.getElementById("xpm-region-highlight-style")) {
      const style = document.createElement("style");
      style.id = "xpm-region-highlight-style";
      style.textContent = `
      .xpm-region-highlight:hover {
        outline: 2px solid #007373 !important;
        outline-offset: -2px;
      }
    `;

      document.head.appendChild(style);
    }

    const regions = document.querySelectorAll<HTMLElement>("[data-region]");

    regions.forEach(region => {
      region.classList.add("xpm-region-highlight");
    });
  }

  private addComponentHighlight(): void {
    if (!document.getElementById("xpm-component-highlight-style")) {
      const style = document.createElement("style");
      style.id = "xpm-component-highlight-style";
      style.textContent = `
      .xpm-component-highlight:hover {
        outline: 2px solid #007373 !important;
        outline-offset: -2px;
      }
    `;

      document.head.appendChild(style);
    }

    const components = document.querySelectorAll<HTMLElement>("[data-component-id]");

    components.forEach(component => {
      component.classList.add("xpm-component-highlight");
    });
  }

  private enableEditor(inputFields: NodeListOf<Element>): void {
    inputFields.forEach(item => {
      item.classList.remove("disabledEditor");
      item.classList.add("activeEditor");
    });
  }

  private disableEditor(inputFields: NodeListOf<Element>): void {
    inputFields.forEach(item => {
      item.classList.add("disabledEditor");
      item.classList.remove("activeEditor");
    });
  }

  private async getSchemaId(fieldName: string, valueElement: HTMLElement, componentId: string): Promise<void> {
    const response = await this.api.getRequest(`/items/${componentId}?useDynamicVersion=false`);
    if (response?.Schema) {
      const schemaid = response.Schema.IdRef.split(":").join("_");
      this.getFieldType(fieldName, valueElement, schemaid);
    }
  }

  private async getFieldType(fieldName: string, valueElement: HTMLElement, schemid: string): Promise<void> {
    const valueText = valueElement.textContent.trim();
    const parentComponent = valueElement.closest("[data-component-id]");
    const parentFieldName = valueElement.closest("[data-fieldname]");
    if (valueText !== "" && parentComponent && parentFieldName) {
      const componentId = parentComponent.getAttribute("data-component-id") || "";
      const dataFieldName = parentFieldName.getAttribute("data-fieldname") || "";
      const storageData = JSON.parse(localStorage.getItem("clonedText") as string) || {};

      storageData[componentId] = storageData[componentId] || {};
      storageData[componentId][dataFieldName] = valueText;
      localStorage.setItem("clonedText", JSON.stringify(storageData));
    }

    const response = await this.api.getRequest(`/items/${schemid}?useDynamicVersion=false`);
    document.querySelector(".xpmlite-loading")?.remove();

    if (!response?.Fields) return;

    if (response.Fields[fieldName]) {
      const fieldType = response.Fields[fieldName].$type;
      if (fieldType === "SingleLineTextFieldDefinition" || fieldType === "MultiLineTextFieldDefinition") {
        this.inputFieldEditor(fieldName, valueElement);
      }
    } else {
      for (const key in response.Fields) {
        const parentField = response.Fields[key];
        if (parentField.EmbeddedFields?.[fieldName]) {
          const embedType = parentField.EmbeddedFields[fieldName].$type;
          if (embedType === "XhtmlFieldDefinition") {
            this.richTextEditor(fieldName, valueElement);
          } else if (embedType === "SingleLineTextFieldDefinition") {
            this.inputFieldEditor(fieldName, valueElement);
          }
        }
      }
    }
  }

  private editorHandlers() {
    return `
            <div class="editor-action">
                <button type="button" title="Cancel Editing" aria-label="Cancel Editing" class="editor-action-btn cancelComponentEditing">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" class="bi bi-x-square" viewBox="0 0 16 16">
                        <path d="M14 1a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1zM2 0a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2z"/>
                        <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708"/>
                    </svg>
                </button>
                <button type="button" title="Save" aria-label="Save" class="editor-action-btn saveComponent">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" class="bi bi-check-square" viewBox="0 0 16 16">
                        <path d="M14 1a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1zM2 0a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2z"/>
                        <path d="M10.97 4.97a.75.75 0 0 1 1.071 1.05l-3.992 4.99a.75.75 0 0 1-1.08.02L4.324 8.384a.75.75 0 1 1 1.06-1.06l2.094 2.093 3.473-4.425a.235.235 0 0 1 .02-.022z"/>
                    </svg>
                </button>
            </div>`;
  }

  private inputFieldEditor(fieldName: string, valueElement: HTMLElement): void {
    valueElement.innerHTML = `<input type="text" name="${fieldName}" value="${valueElement.textContent.trim()}" id="xpm-edit" class="xpm-form-control" />` + this.editorHandlers();
    const input = valueElement.querySelector("#xpm-edit") as HTMLInputElement;
    if (valueElement) {
      valueElement.classList.add("xpm-active-field")
    }
    requestAnimationFrame(() => {
      input?.focus();

      const length = input.value.length;
      input.setSelectionRange(length, length);
    });
  }

  private richTextEditor(fieldName: string, valueElement: HTMLElement): void {
    const targetId = `xpm-textarea-${Date.now()}`;
    valueElement.innerHTML = `<textarea name="${fieldName}" id="${targetId}" class="xpm-form-control" style="height:200px">${valueElement.textContent}</textarea>` + this.editorHandlers();
    const textarea = valueElement.querySelector(`#${targetId}`) as HTMLTextAreaElement;
    if (valueElement) {
      valueElement.classList.add("xpm-active-field")
    }
    requestAnimationFrame(() => {
      textarea?.focus();
    });
    if (tinymce.get(targetId)) {
      tinymce.execCommand('mceRemoveEditor', false, targetId);
    }

    tinymce.init({
      selector: `#${targetId}`,
      license_key: 'gpl',
      base_url: 'https://cdnjs.cloudflare.com/ajax/libs/tinymce/7.7.0',
      suffix: '.min',
      plugins: 'nonbreaking anchor autolink charmap codesample emoticons image link searchreplace table visualblocks wordcount',
      toolbar: 'undo redo | blocks | bold italic underline | link image table | removeformat',
      entity_encoding: "raw",
      setup: (editor: any) => {
        editor.on("init", () => {
          editor.focus();
          editor.selection.select(editor.getBody(), true);
          editor.selection.collapse(false);
        })
      }
    });
  }

  private showEditor(target: HTMLElement): void {
    if (target.tagName !== "INPUT" && target.tagName !== "TEXTAREA") {
      const fieldnameContainer = target.closest("[data-fieldname]") as HTMLElement;
      if (!fieldnameContainer) return;

      const loadingDiv = document.createElement("div");
      loadingDiv.className = "xpmlite-loading";
      loadingDiv.textContent = "Loading...";
      Object.assign(loadingDiv.style, {
        color: "#fff",
        position: "relative"
      })
      fieldnameContainer.parentNode?.insertBefore(loadingDiv, fieldnameContainer.nextSibling);
      const parentComponent = target.closest("[data-component-id]");
      if (!parentComponent) return;

      const componentId = (parentComponent.getAttribute("data-component-id") || "").split(":").join("_");
      const name = fieldnameContainer.getAttribute("data-fieldname") || "";

      this.getSchemaId(name, fieldnameContainer, componentId);
    }
  }

  private updateInputField(e: Event): void {
    const target = e.target as HTMLInputElement | HTMLTextAreaElement;
    const regionEl = target.closest("[data-region]");
    if (!regionEl) return;

    const region = regionEl.getAttribute("data-region") || "";
    const localStorageData = JSON.parse(localStorage.getItem(region) as string) || {};

    localStorageData[target.name] = target.value;
    localStorage.setItem(region, JSON.stringify(localStorageData));
  }

  private cancelEditing(target: HTMLElement): void {
    const field = target.closest("[data-fieldname]") as HTMLElement;
    if (!field) return;
    field.classList.remove("xpm-active-field")
    const parentComponent = field.closest("[data-component-id]");
    if (!parentComponent) return;

    const componentId = parentComponent.getAttribute("data-component-id") || "";
    const fieldName = field.getAttribute("data-fieldname") || "";

    const textarea = field.querySelector('textarea');
    if (textarea?.id) {
      tinymce.execCommand('mceRemoveEditor', false, textarea.id);
    }

    const cachedText = JSON.parse(localStorage.getItem("clonedText") as string);
    if (cachedText?.[componentId]) {
      field.innerHTML = cachedText[componentId][fieldName] || '';
    }
  }

  private initEventDelegation(): void {

    document.addEventListener("click", (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const saveBtn = target.closest(".saveComponent");
      if (!saveBtn) return;

      e.stopPropagation();
      const parentComp = saveBtn.closest("[data-component-id]");
      if (!parentComp) return;

      const compId = parentComp.getAttribute("data-component-id");
      if (!compId) return;
      const tcmId = compId.split(":").join('_');
      const indexElement = saveBtn.closest("[data-index]");
      if (!indexElement) return;

      const nestedIndex = indexElement.parentElement?.closest("[data-index]");
      const indexPosition = nestedIndex ? nestedIndex.getAttribute("data-index") : indexElement.getAttribute("data-index");

      this.updateComponent(tcmId, saveBtn, indexPosition);
    });

    document.addEventListener("click", (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const cancelBtn = target.closest(".cancelComponentEditing") as HTMLElement;
      if (cancelBtn) this.cancelEditing(cancelBtn);
    });

    document.addEventListener("dblclick", (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const fieldContainer = target.closest("[data-fieldname]");
      if (!fieldContainer || fieldContainer.classList.contains("disabledEditor")) return;

      e.preventDefault();
      e.stopPropagation();

      const fieldType = fieldContainer.getAttribute("data-fieldname");
      if ((fieldType === "image" || fieldType === "media") && this.media) {
        const parentComp = target.closest("[data-component-id]");
        const parentField = target.closest("[data-fieldname]");
        const indexElement = target.closest("[data-index]");

        if (!parentComp || !parentField || !indexElement) return;

        const componentId = (parentComp.getAttribute("data-component-id") || "").split(":").join("_");
        const fieldName = parentField.getAttribute("data-fieldname") || "";
        const nestedIndex = indexElement.parentElement?.closest("[data-index]");
        const itemPosition = nestedIndex ? nestedIndex.getAttribute("data-index") : indexElement.getAttribute("data-index");

        this.media.render(componentId, fieldName, itemPosition as string, fieldContainer as HTMLElement);
      } else {
        this.showEditor(target);
      }
    });

    document.addEventListener("change", (e: Event) => {
      const target = e.target as HTMLElement;
      if (target.closest("[data-fieldname]")) {
        this.updateInputField(e);
      }
    });
  }
}
