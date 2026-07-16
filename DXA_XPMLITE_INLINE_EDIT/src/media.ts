import { ApiClient } from "./apiClient";

interface XpmTreeNode {
    Id?: string;
    title?: string;
    Title?: string;
    items?: XpmTreeNode[];
    contentItems?: any[];
    loaded?: boolean;
    $type?: string;
    VersionInfo?: { RevisionDate: string };
    BinaryContent?: { Url: string };
    LinkedSchema?: { Title: string };
    Schema?: { Title: string };
    BluePrintInfo?: { OwningRepository?: { Title: string } };
    IsPublishedInContext?: boolean;
}

export class Media {
    private api: ApiClient

    private orgStructure: XpmTreeNode[];
    private publication: any | null;
    private rootContentItems: any[];
    private selectedMedia: { Id: string; Title: string };
    private isLoading: boolean;
    private layout: string;
    private currentItems: any[];
    private selectedTreeNode: HTMLElement | null;
    private targetElement: HTMLElement | null;
    private dom: {
        sidebar: () => HTMLElement | null;
        body: () => HTMLElement | null;
        title: () => HTMLElement | null;
        saveBtn: () => HTMLButtonElement | null;
    };

    constructor(api: ApiClient) {
        this.api = api
        this.orgStructure = [];
        this.publication = null;
        this.rootContentItems = [];
        this.selectedMedia = { Id: "", Title: "" };
        this.isLoading = false;
        this.layout = "table";
        this.currentItems = [];
        this.selectedTreeNode = null;
        this.targetElement = null;
        this.dom = {
            sidebar: () => document.querySelector(".media-modal-sidebar"),
            body: () => document.querySelector(".media-modal-body"),
            title: () => document.querySelector(".selected-item-title"),
            saveBtn: () => document.querySelector(".save")
        };
    }
    getTreeData(): any[] {
        if (!this.publication) {
            return []
        }
        return [{
            Id: this.publication.Id,
            title: this.publication.Title,
            items: this.orgStructure,
            contentItems: this.rootContentItems,
            loaded: true
        }]
    }

    setActiveTreeNode(item: HTMLElement): void {
        if (this.selectedTreeNode) {
            Object.assign(this.selectedTreeNode.style, {
                backgroundColor: "",
                color: "",
                border: ""
            });
        }

        Object.assign(item.style, {
            backgroundColor: "#e5f2f2",
            border: "1px solid #007373",
            color: "#007373"
        })

        this.selectedTreeNode = item;
        const titleEL = this.dom.title();
        if (titleEL) {
            titleEL.innerHTML = `<span style="display:flex;gap:5px; flex-direction:row;">
                <svg version="1.1" fill="currentColor" preserveAspectRatio="xMidYMid meet" viewBox="0 0 16 13" style="width:16px;height:16px;">
                    <path d="M7.94 1.94l-1.214.808A1.5 1.5 0 0 1 5.894 3H0V1.4A1.4 1.4 0 0 1 1.4 0h4.186a1 1 0 0 1 .707.293l1.646 1.646zM9.65 2H14.6A1.4 1.4 0 0 1 16 3.4v8.2a1.4 1.4 0 0 1-1.4 1.4H1.4A1.4 1.4 0 0 1 0 11.6V4h5.894a2.5 2.5 0 0 0 1.387-.42L9.651 2z" fill="#ffb238"></path>
                </svg> ${item?.textContent?.trim() || ""}
            </span>`
        }
    }

    updateOrgStructure(): void {
        const sidebar = this.dom.sidebar();
        if (!sidebar) return;
        sidebar.innerHTML = "";
        sidebar.appendChild(this.createTree(this.getTreeData()));
    }

    renderEmptyLayout(container: HTMLElement): void {
        container.innerHTML = `<div style="padding:15px; color:#666;"> No media items found</div>`;
    }

    async gridViewLayout(items: XpmTreeNode[]): Promise<void> {
        const body = this.dom.body();
        if (!body) return;

        if (!Array.isArray(items) || !items.length) {
            this.renderEmptyLayout(body)
            return;
        }

        body.innerHTML = "";
        const grid = document.createElement("div");
        Object.assign(grid.style, {
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, 230px)",
            gap: "20px",
            justifyContent: "start"
        })

        // grid.innerHTML = items.map(item => this.getGridCardTemplate(item)).join("")
        body.appendChild(grid)

        grid.addEventListener("click", (e: MouseEvent) => {
            const target = e.target as HTMLElement;
            const card = target.closest(".multimedia-card") as HTMLElement | null;
            if (!card || (!card.querySelector("img") && card.dataset.type !== "Folder")) return;

            grid.querySelectorAll(".multimedia-card").forEach(selectedImg => {
                const htmlCard = selectedImg as HTMLElement;
                htmlCard.style.background = "#fff";
                htmlCard.style.border = "1px solid #ccc";
            });

            card.style.background = "#e5f2f2";
            card.style.border = "1px solid #007373";

            const targetImg = card.querySelector("img") as HTMLImageElement | null;
            if (targetImg) {
                this.selectedMedia.Id = targetImg.dataset.componentId || ""
                this.selectedMedia.Title = targetImg.dataset.componentTitle || ""

                if (this.targetElement) {
                    const displayImg = this.targetElement.querySelector("img");
                    if (displayImg) {
                        displayImg.setAttribute("src", targetImg.src)
                    };

                    const saveBtn = this.dom.saveBtn();
                    if (saveBtn) {
                        saveBtn.removeAttribute("disabled")
                        Object.assign(saveBtn.style, {
                            cursor: "pointer",
                            background: "#007373"
                        })
                    }
                }
            }
        });

        items.forEach(async (item) => {

            const placeholder = document.createElement("div");
            grid.appendChild(placeholder);

            const cardHtml = await this.getGridCardTemplate(item);

            const tempContainer = document.createElement("div");
            tempContainer.innerHTML = cardHtml.trim();
            const cleanCardNode = tempContainer.firstChild;

            if (cleanCardNode && placeholder.parentNode) {
                placeholder.parentNode.replaceChild(cleanCardNode, placeholder);
            }
        });
    }

    async getGridCardTemplate(item: XpmTreeNode): Promise<string> {
        const isFolder = item.$type === "Folder";
        const dateStr = item.VersionInfo?.RevisionDate ? new Date(item.VersionInfo.RevisionDate).toLocaleString() : "";
        let binaryImage = "";
        if (!isFolder && item.BinaryContent?.Url) {
            try {
                binaryImage = await this.api.getBinaryContent(item.BinaryContent?.Url as string)
            }
            catch (error) {
                console.error(`Failed to fetch binary image for item ${item.Id}:`, error);
            }
        }
        return `
            <div class="multimedia-card" style="border:1px solid #ccc; border-radius:8px; width: 100%; min-height: 210px; box-sizing:border-box; display:flex; flex-direction:column; gap:5px; justify-content: center; align-items: center; background-color:#fff; cursor:pointer;">
                ${!isFolder
                ? `<img src="${binaryImage || ''}" style="object-fit:cover; height:140px; width:100%; max-width:220px; border-radius:8px" data-component-id="${item.Id}" data-component-title="${item.Title}" />`
                : `<svg version="1.1" fill="currentColor" viewBox="0 0 16 13" style="width:60px; height:60px"><path d="M7.94 1.94l-1.214.808A1.5 1.5 0 0 1 5.894 3H0V1.4A1.4 1.4 0 0 1 1.4 0h4.186a1 1 0 0 1 .707.293l1.646 1.646zM9.65 2H14.6A1.4 1.4 0 0 1 16 3.4v8.2a1.4 1.4 0 0 1-1.4 1.4H1.4A1.4 1.4 0 0 1 0 11.6V4h5.894a2.5 2.5 0 0 0 1.387-.42L9.651 2z" fill="#ffb238"></path></svg>`
            }
                <div style="width:100%; height:auto; border-radius:8px; overflow:hidden; padding: 0 10px; box-sizing: border-box; text-align: center;">
                    <h5 style="font-size:14px; margin: 4px 0; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">${item.Title || ''}</h5>
                    <p style="font-size:12px; margin:0; color: #666;">${dateStr}</p>
                </div>
            </div>`;

    }

    tableViewLayout(items: XpmTreeNode[]) {
        const body = this.dom.body();
        if (!body) return;

        if (!Array.isArray(items) || !items.length) {
            this.renderEmptyLayout(body);
            return;
        }

        body.innerHTML = "";
        const table = document.createElement("table");
        Object.assign(table.style, {
            width: "100%",
            borderCollapse: "collapse",
            background: "#fff"
        })

        table.innerHTML = `
        <thead>
            <tr style="background:#f5f5f5;">
                <th style="padding:10px;border:1px solid #ddd;text-align:left;font-weight:normal;">Name</th>
                <th style="padding:10px;border:1px solid #ddd;text-align:left;font-weight:normal;">Status</th>
                <th style="padding:10px;border:1px solid #ddd;text-align:left;font-weight:normal;">Schema</th>
                <th style="padding:10px;border:1px solid #ddd;text-align:left;font-weight:normal;">Shared From</th>
                <th style="padding:10px;border:1px solid #ddd;text-align:left;font-weight:normal;">Date Modified</th>
            </tr>
        </thead>
        <tbody></tbody>`;

        const tbody = table.querySelector("tbody");

        items.forEach(item => {

            const row = document.createElement("tr");
            row.dataset.componentId = item.Id || "";
            row.dataset.componentTitle = item.Title || "";
            row.dataset.imgSrc = item.BinaryContent?.Url || "";
            row.style.cursor = "pointer";

            const schemaTitle = item?.LinkedSchema?.Title ?? item?.Schema?.Title ?? "";
            const owningRepo = item?.BluePrintInfo?.OwningRepository?.Title ?? "";
            const modDate = item.VersionInfo?.RevisionDate ? new Date(item.VersionInfo.RevisionDate).toLocaleString() : "";

            row.innerHTML = `
            <td style="padding:8px;border-bottom:1px solid #e3e6eb;text-align:left;font-weight:normal;">
                ${item.$type === "Folder" ?
                    `<svg version="1.1" fill="currentColor" preserveAspectRatio="xMidYMid meet" viewBox="0 0 16 13" style="width:16px;height:16px;color:#758099;"><path d="M7.94 1.94l-1.214.808A1.5 1.5 0 0 1 5.894 3H0V1.4A1.4 1.4 0 0 1 1.4 0h4.186a1 1 0 0 1 .707.293l1.646 1.646zM9.65 2H14.6A1.4 1.4 0 0 1 16 3.4v8.2a1.4 1.4 0 0 1-1.4 1.4H1.4A1.4 1.4 0 0 1 0 11.6V4h5.894a2.5 2.5 0 0 0 1.387-.42L9.651 2z" fill="#ffb238"></path></svg>`
                    :
                    `<svg version="1.1" fill="currentColor" preserveAspectRatio="xMidYMid meet" viewBox="0 0 16 16" style="width:16px;height:16px;color:#758099;"><path d="M16 5v10.589a.421.421 0 0 1-.428.411H.428A.421.421 0 0 1 0 15.589V5h16zM.208 4L3.368.158A.433.433 0 0 1 3.702 0H12.3c.132 0 .253.058.335.158L15.796 4H.207zM6 8v5l5-2.5L6 8z"></path></svg>`
                }
                ${item.Title || ""}
            </td>
            <td style="padding:8px;border-bottom:1px solid #e3e6eb;text-align:left;font-weight:normal;">
                ${item.IsPublishedInContext ? "Published" : ""}
            </td>
            <td style="padding:8px;border-bottom:1px solid #e3e6eb;text-align:left;font-weight:normal;">
                ${schemaTitle}
            </td>
            <td style="padding:8px;border-bottom:1px solid #e3e6eb;text-align:left;font-weight:normal;">
                ${owningRepo}
            </td>
            <td style="padding:8px;border-bottom:1px solid #e3e6eb;text-align:left;font-weight:normal;">
                ${modDate}
            </td>`;

            row.addEventListener("click", async () => {
                tbody?.querySelectorAll("tr").forEach(trow => trow.style.background = "none");
                row.style.background = "#e5f2f2";

                const binaryImage = await this.api.getBinaryContent(row.dataset.imgSrc as string)
                if (binaryImage) {

                    this.selectedMedia.Id = row.dataset.componentId || "";
                    this.selectedMedia.Title = row.dataset.componentTitle || "";

                    if (this.targetElement) {
                        const displayImg = this.targetElement.querySelector("img");
                        if (displayImg) {
                            displayImg.setAttribute("src", binaryImage)
                        };

                        const saveBtn = this.dom.saveBtn();
                        if (saveBtn) {
                            saveBtn.removeAttribute("disabled")
                            Object.assign(saveBtn.style, {
                                cursor: "pointer",
                                background: "#007373"
                            })
                        }
                    }
                }
            });

            tbody?.appendChild(row);
        });

        body.appendChild(table);
    }

    layoutSwitcher(items: any[] = []): void {
        this.currentItems = items;
        if (this.layout === "table") {
            this.tableViewLayout(items);
        } else {
            this.gridViewLayout(items);
        }
    }

    setExpandedIcon(icon: HTMLElement, expanded: boolean): void {
        icon.innerHTML = expanded
            ? `<svg version="1.1" fill="currentColor" preserveAspectRatio="xMidYMid meet" viewBox="0 0 16 16" style="height:16px;width:16px;"><path d="M12.81927 5.18452c-.24096-.24604-.63525-.24604-.87622 0L8 9.21064 4.05695 5.18452c-.24097-.24604-.63526-.24604-.87622 0s-.24097.64868 0 .89471L8 11.00001l4.81927-4.92078c.24097-.24603.24097-.64868 0-.89471z"></path></svg>`
            : `<svg version="1.1" fill="currentColor" preserveAspectRatio="xMidYMid meet" viewBox="0 0 16 16" style="height:16px;width:16px;"><path d="M10.55268 7.56189L6.07923 3.18073c-.24603-.24097-.64868-.24097-.89471 0s-.24604.63525 0 .87622L9.21064 8l-4.02612 3.94305c-.24604.24097-.24604.63526 0 .87622s.64868.24097.89471 0l4.47345-4.38116L11.00001 8l-.44733-.43811z"></path></svg>`;
    }

    createTree(nodes: XpmTreeNode[] = []): HTMLUListElement {
        const ul = document.createElement("ul");
        Object.assign(ul.style, { listStyle: "none", paddingLeft: "20px", margin: "0" });

        nodes.forEach(node => {
            const icon = document.createElement("span");
            icon.style.lineHeight = "normal";
            this.setExpandedIcon(icon, false);

            const title = node.title ?? node.Title ?? "";
            const li = document.createElement("li");
            li.style.margin = "2px 0";

            const label = document.createElement("span");
            label.textContent = title;

            const item = document.createElement("div");
            item.className = "tree-node";
            Object.assign(item.style, { display: "flex", alignItems: "center", cursor: "pointer", padding: "4px 8px", borderRadius: "4px", gap: "6px" });

            item.appendChild(icon);
            item.appendChild(label);

            item.addEventListener("mouseenter", () => {
                if (this.selectedTreeNode !== item) item.style.backgroundColor = "#f5f5f5";
            });
            item.addEventListener("mouseleave", () => {
                if (this.selectedTreeNode !== item) item.style.backgroundColor = "";
            });

            const childrenContainer = document.createElement("div");
            childrenContainer.className = "tree-children";
            Object.assign(childrenContainer.style, { display: "none", marginLeft: "10px" });

            li.appendChild(item);
            li.appendChild(childrenContainer);

            if (node.items && node.items.length > 0) {
                childrenContainer.appendChild(this.createTree(node.items));

                item.addEventListener("click", (e: MouseEvent) => {
                    e.stopPropagation();
                    this.setActiveTreeNode(item);
                    const expanded = childrenContainer.style.display === "block";
                    childrenContainer.style.display = expanded ? "none" : "block";
                    this.setExpandedIcon(icon, !expanded);
                    this.layoutSwitcher(node.contentItems || []);
                });
            } else {
                item.addEventListener("click", async (e: MouseEvent) => {
                    e.stopPropagation();
                    this.setActiveTreeNode(item);

                    if (node.loaded) {
                        const expanded = childrenContainer.style.display === "block";
                        childrenContainer.style.display = expanded ? "none" : "block";
                        this.setExpandedIcon(icon, !expanded);
                        this.layoutSwitcher(node.contentItems || []);
                        return;
                    }

                    childrenContainer.style.display = "block";
                    childrenContainer.innerHTML = "<div style='padding:5px; color:#888;'>Loading...</div>";
                    this.setExpandedIcon(icon, true);

                    try {
                        const targetId = node.Id ?? "";
                        const children = await this.getChildren(targetId);

                        const folders = children.filter((child: any) => child.$type === "Folder");
                        const contentItems = children.filter((child: any) => child.$type === "Folder" || (child.$type === "Component" && child.ComponentType === "Multimedia"));

                        node.items = folders;
                        node.contentItems = contentItems;
                        node.loaded = true;
                        childrenContainer.innerHTML = "";

                        if (node.items && node.items.length > 0) {
                            childrenContainer.appendChild(this.createTree(node.items));
                        } else {
                            icon.style.visibility = "hidden";
                        }
                        this.layoutSwitcher(contentItems);
                    } catch (error) {
                        console.error("Failed to load children nodes:", error);
                        childrenContainer.innerHTML = "<div style='padding:5px; color:red;'>Failed loading items</div>";
                        childrenContainer.style.display = "none";
                        this.setExpandedIcon(icon, false);
                    }
                });
            }

            ul.appendChild(li);
        });

        return ul;
    }

    async getChildren(id: string): Promise<any[]> {
        const itemId = id.replace(/:/g, "_");
        return await this.api.getRequest(`/items/${itemId}/items?useDynamicVersion=true&recursive=false&details=Contentless`);
    }

    private async updateMedia(componentResponse: any, itemPosition: string, fieldName: string, overlay: HTMLElement): Promise<void> {
        try {
            this.isLoading = true;
            const saveBtn = this.dom.saveBtn();
            if (saveBtn) {
                saveBtn.textContent = "Saving...";
                saveBtn.setAttribute("disabled", "true")
            }
            const parentRef = componentResponse?.BluePrintInfo?.PrimaryBluePrintParentItem?.IdRef;
            if (!parentRef) {
                throw new Error("Primary blueprint parent structural context missing.");
            }

            const checkoutId = parentRef.replace(/:/g, "_");
            const checkoutResponse = await this.api.postService(`/items/${checkoutId}/checkOut`, {});

            const position = Number(itemPosition);

            if (position === 0 && checkoutResponse.Content[fieldName] !== undefined) {
                checkoutResponse.Content[fieldName].IdRef = this.selectedMedia.Id;
                checkoutResponse.Content[fieldName].Title = this.selectedMedia.Title;
            } else {
                for (const element in checkoutResponse.Content) {
                    if (Array.isArray(checkoutResponse.Content[element])) {
                        checkoutResponse.Content[element].forEach((item: any, index: number) => {
                            if (Object.prototype.hasOwnProperty.call(item, fieldName) && index === position) {
                                item[fieldName].IdRef = this.selectedMedia.Id;
                                item[fieldName].Title = this.selectedMedia.Title;
                            }
                        });
                    }
                }
            }

            const targetUpdateId = checkoutResponse.Id.replace(/:/g, "_");
            const updateComponent = await this.api.putService(`/items/${targetUpdateId}`, checkoutResponse);

            const targetCheckInId = updateComponent.Id.replace(/:/g, "_");
            await this.api.postService(`/items/${targetCheckInId}/checkIn`, { "RemovePermanentLock": true });

            this.isLoading = false;
            overlay.remove();

            if (saveBtn) saveBtn.textContent = "Save & Finish";
            saveBtn?.setAttribute("disabled", "false")
        } catch (error) {
            console.error("Failed to update selected media", error);
            this.isLoading = false;
            const saveBtn = this.dom.saveBtn();
            if (saveBtn) {
                saveBtn.setAttribute("disabled", "false")
                saveBtn.textContent = "Save & Finish";
            }
        }
    }

    async render(componentId: string, fieldName: string, itemPosition: string, currentTargetElement: HTMLElement): Promise<void> {
        this.targetElement = currentTargetElement;
        document.querySelector(".media-overlay")?.remove();
        // document.body.style.overflow = "hidden";
        this.isLoading = true;

        const overlay = document.createElement("div");
        overlay.className = "media-overlay";

        this.selectedMedia = { Id: "", Title: "" };
        overlay.style.cssText = `
            position: fixed;
            inset: 0;
            background: rgba(0,0,0,0.5);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 9999;
        `;

        const modal = document.createElement("div");
        modal.style.cssText = `
            background: white;
            border-radius: 8px;
            min-width: 300px;
            text-align: center;
            width:calc(100% - 300px);
            height:calc(100% - 100px);
        `;

        modal.innerHTML = `<div style="width: 100%;height: 100%;display: flex;justify-content: space-between;flex-direction: column;">
            <div style="width:100%;border-bottom:1px solid #eee; display:flex; align-items:center;justify-content:space-between;padding: 10px;">
                <h4 style="margin:0">Select an item</h4>
                <button class="closeModalBtn" style="background:transparent;border: 1px solid #fff;padding: 5px 20px; border-radius: 5px;cursor: pointer;">X</button>
            </div>
            <div class="media-modal-content" style="width:100%;display:flex; flex:1; overflow:hidden;">
                <div class="media-modal-sidebar" style="width:280px;min-width:250px;max-width:350px;overflow-y:auto; background:#fff;flex:3;border-right: 1px solid #e1e7eb;display:flex;justify-content: flex-start; height:calc(100vh - 200px);overflow-y:auto">
                    ${this.isLoading ? `<span style="padding:10px;">Loading...</span>` : ""}
                </div>
                <div style="flex:7;background:#eee;height:calc(100vh - 200px); overflow-y:auto;padding:10px;">
                    <div style="display:flex;align-items:center;justify-content:space-between;width:100%;padding:5px;">
                        <div class="selected-item-title" style="display:flex;width:100%"></div>
                        <div class="switch-view" style="display:flex;justify-content:flex-end;width:100%;gap:10px;padding-bottom:10px;">
                            <svg data-layout="table" version="1.1" fill="currentColor" preserveAspectRatio="xMidYMid meet" viewBox="0 0 16 16" style="width:16px;height:16px;">
                                <path d="M14.8125 3.5625H1.1875C1.13777 3.5625 1.09008 3.54275 1.05492 3.50758C1.01975 3.47242 1 3.42473 1 3.375V2.625C1 2.57527 1.01975 2.52758 1.05492 2.49242C1.09008 2.45725 1.13777 2.4375 1.1875 2.4375H14.8125C14.8622 2.4375 14.9099 2.45725 14.9451 2.49242C14.9802 2.52758 15 2.57527 15 2.625V3.375C15 3.42473 14.9802 3.47242 14.9451 3.50758C14.9099 3.54275 14.8622 3.5625 14.8125 3.5625ZM14.8125 8.5625H1.1875C1.13777 8.5625 1.09008 8.54275 1.05492 8.50758C1.01975 8.47242 1 8.42473 1 8.375V7.625C1 7.57527 1.01975 7.52758 1.05492 7.49242C1.09008 7.45725 1.13777 7.4375 1.1875 7.4375H14.8125C14.8622 7.4375 14.9099 7.45725 14.9451 7.49242C14.9802 7.52758 15 7.57527 15 7.625V8.375C15 8.42473 14.9802 8.47242 14.9451 8.50758C14.9099 8.54275 14.8622 8.5625 14.8125 8.5625ZM14.8125 13.5625H1.1875C1.13777 13.5625 1.09008 13.5427 1.05492 13.5076C1.01975 13.4724 1 13.4247 1 13.375V12.625C1 12.5753 1.01975 12.5276 1.05492 12.4924C1.09008 12.4573 1.13777 12.4375 1.1875 12.4375H14.8125C14.8622 12.4375 14.9099 12.4573 14.9451 12.4924C14.9802 12.5276 15 12.5753 15 12.625V13.375C15 13.4247 14.9802 13.4724 14.9451 13.5076C14.9099 13.5427 14.8622 13.5625 14.8125 13.5625Z"></path>
                            </svg>
                            <svg data-layout="grid" version="1.1" fill="currentColor" preserveAspectRatio="xMidYMid meet" viewBox="0 0 15 13" style="width:16px;height:16px;">
                                <path d="M1 6h6V1H1v5zm0 1v5h6V7H1zm13-1V1H8v5h6zm0 1H8v5h6V7zM1 0h13a1 1 0 0 1 1 1v11a1 1 0 0 1-1 1H1a1 1 0 0 1-1-1V1a1 1 0 0 1 1-1z"></path>
                            </svg>
                        </div>
                    </div>
                    <div class="media-modal-body">
                        ${this.isLoading ? "Loading..." : ""}
                    </div>
                </div>
            </div>
            <div style="width:100%;display:flex; align-items:center; justify-content:flex-end;gap:5px;border-top: 1px solid #dee2e6;padding: 10px;">
                <button class="save" style="border: 1px solid #dee2e6;padding: 5px 20px;border-radius: 5px;cursor: pointer;background-color:#007373;color:#fff;">Save & Finish</button>
                <button class="closeModalBtn" style="border: 1px solid #dee2e6;padding: 5px 20px;border-radius: 5px;cursor: pointer;">Cancel</button>
            </div>
        </div>`;

        overlay.appendChild(modal);
        document.body.appendChild(overlay);

        modal.querySelectorAll(".closeModalBtn").forEach(btn => {
            btn.addEventListener("click", () => {
                document.body.style.overflow = "";
                overlay.remove();
            });
        });

        const switchView = modal.querySelector(".switch-view") as HTMLElement;
        const svgs = switchView.querySelectorAll("svg");
        if (svgs.length > 0) svgs[0].style.color = "#007373";

        switchView.addEventListener("click", (e: MouseEvent) => {
            const target = e.target as HTMLElement;
            const svg = target.closest("svg");
            if (!svg) return;
            svgs.forEach(icon => {
                icon.style.color = "";
                icon.style.cursor = "pointer";
            });

            svg.style.color = "#007373";
            this.layout = svg.dataset.layout || "table";
            this.layoutSwitcher(this.currentItems);
        });

        const saveButton = modal.querySelector(".save") as HTMLButtonElement | null;
        if (saveButton) {
            saveButton.setAttribute("disabled", "true");
            Object.assign(saveButton.style, {
                cursor: "not-allowed",
                background: "#eee"
            });
        }

        try {
            const id = componentId.replace(/:/g, "_");
            const componentResponse = await this.api.getRequest(`/items/${id}?useDynamicVersion=true`);
            const owningRepository = componentResponse.BluePrintInfo.OwningRepository.IdRef.replace(/:/g, "_");

            this.isLoading = true;
            const [publication, orgStructure] = await Promise.all([
                this.api.getRequest(`/items/${owningRepository}?useDynamicVersion=true`),
                this.api.getRequest(`/items/${owningRepository}/items?useDynamicVersion=true&recursive=false&details=Contentless`)
            ]);

            this.publication = publication;
            this.orgStructure = orgStructure.filter((item: any) => item.$type === "Folder");
            this.rootContentItems = orgStructure.filter(
                (item: any) => item.$type === "Folder" || (item.$type === "Component" && item.ComponentType === "Multimedia")
            );
            this.isLoading = false;

            const modalBody = modal.querySelector(".media-modal-body");
            if (modalBody) modalBody.innerHTML = "";

            this.updateOrgStructure();
            this.layoutSwitcher(this.rootContentItems);

            if (saveButton) {
                saveButton.addEventListener("click", () => this.updateMedia(componentResponse, itemPosition, fieldName, overlay));
            }
        }
        catch (error) {
            console.error("Failed to load items:", error);
            this.isLoading = false;

            const modalBody = modal.querySelector(".media-modal-body");
            if (modalBody) modalBody.innerHTML = "";

            const sidebar = this.dom.sidebar();
            if (sidebar) sidebar.innerHTML = "<div style='color:red; padding:10px;'>Failed to load repository infrastructure structure.</div>";
        }
    }
}