# DXA XPM Lite Setup Guide

DXA XPM Lite provides simplified, lightweight inline editing, component presentation management, and page creation capabilities directly within a Tridion Sites-driven DXA website.

## 1. Installation & Deployment

Choose one of the two options below to get the required frontend assets, then follow the integration steps.


### Option A: Use Pre-Built Releases (Recommended)

If you are deploying stable versions, you can download the compiled assets directly without setting up a local Node.js build environment.

- Download the Latest Release Assets
  
  - Navigate to the project's releases page and download the latest asset archive (dxa-xpmlite-assets.zip or the individual production .js and .css bundles).

- Extract and Copy Assets to DXA Website
  
  - Extract the archive and copy the compiled files directly into your DXA website's assets directory (e.g., /content/js/ and /content/js/).
  
- Update Layout References
  
  - Open the main layout page of your DXA website and update the paths to point to the newly copied asset locations.
  
  - [Follow these steps to update the layout file](#copy-assets-step)


### Option B: Build from Source

Follow these steps to build the frontend assets and deploy them to your DXA website.

#### 1. Build the Inline Edit Module

- Navigate to the root directory of the DXA_XPMLITE_INLINE_EDIT folder and run the following commands.

- Install the node_modules by running the command:
  
  ```bash
    npm install
  ```

- Generate the build files by running the command:

```bash
    npm run build
```

- The compiled distribution files will be generated in the dist directory.


#### 2. Build the React Application

- Navigate to the root directory of the DXA_XPMLITE_INLINE_EDIT folder and run the following commands.

- Install the node_modules by running the command:
  
  ```bash
    npm install
  ```

- Generate the build files by running the command:

```bash
    npm run build
```

- The compiled distribution files will be generated in the dist directory.

#### 3. Copy Assets to DXA Webapp
<Step subtitle="File System" title="Copy Assets to DXA Webapp">
  <span id="copy-assets-step"></span>Copy the generated build files (`.js` and `.css`) from the `dist` folders of both applications into your DXA website's assets directory.
</Step>

#### 4. Update Layout References

- Open the main layout page of your DXA website and update the file paths to reference the newly copied JS and CSS assets.

```html
    @model PageModel
    @using System.Collections
    @using System.Configuration
    @using System.Collections.Specialized
    <!DOCTYPE html>
    <html>
    <head>
        <title>@Model.Title</title>
        @foreach (var meta in Model.Meta)
        {
            <meta name="@meta.Key" content="@meta.Value">
        }
        <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
        <meta http-equiv="X-UA-Compatible" content="IE=edge,chrome=1">
        <meta name="viewport" content="width=device-width,initial-scale=1">
        <meta name="keywords" content="">
        <meta name="description" content="">
        <link rel="icon" href="/content/img/favicon.ico">
        
        <!-- XPMLITE START-->
        <link rel="stylesheet" href="/content/xpmlite/css/dxa-inline-RzZ2T0UD.css">
        <link rel="stylesheet" href="/content/xpmlite/css/dxa-xpmlite-BLyZ_BF3.css">
        <!-- XPMLITE END -->
        
    </head>
    <body>
        @RenderBody()
        <div class="page-loader" style="display: none;">
            <div class="loader">Loading...</div>
        </div>
        <div id="xpmlite"></div> 
        
        @if (WebRequestContext.Localization.IsXpmEnabled)
        {	
            netfw48.App_Start.PageTypeImagesConfigSection pageTypeImageSection = (netfw48.App_Start.PageTypeImagesConfigSection)ConfigurationManager.GetSection("PageTypeImageSection");
    
            List<netfw48.App_Start.PageTypeImage> PageTypeImages = new List<netfw48.App_Start.PageTypeImage>();
            foreach (netfw48.App_Start.FolderElement item in pageTypeImageSection.PageTypeImages)
            {
                PageTypeImages.Add(new netfw48.App_Start.PageTypeImage() { PageTitle = item.PageTitle, Path = item.Path, PublicationID = item.PublicationID });
            }
            var serializedItems = Newtonsoft.Json.JsonConvert.SerializeObject(PageTypeImages);
            <script src="https://cdnjs.cloudflare.com/ajax/libs/tinymce/7.7.0/tinymce.min.js" referrerpolicy="origin"></script>
            <script type="text/javascript">
                function getPageTypeImages(){
                    var images = @Html.Raw(@serializedItems);
                    return images;
                }
                function getConfig(){
                    const config = {
                        staging:'@WebRequestContext.Localization.IsXpmEnabled',
                        client_id:'@System.Configuration.ConfigurationManager.AppSettings["client_id"]',
                        redirect_uri:'@System.Configuration.ConfigurationManager.AppSettings["redirect_uri"]',
                        openapi_baseurl : '@System.Configuration.ConfigurationManager.AppSettings["openapi_baseurl"]',
                        authorization_baseurl : '@System.Configuration.ConfigurationManager.AppSettings["authorization_baseurl"]',					
                        contentServiceUrl:'@System.Configuration.ConfigurationManager.AppSettings["contentServiceUrl"]',
                        experience_space_url:'@System.Configuration.ConfigurationManager.AppSettings["experience_space_url"]',
                        
                    }
                    return config;
                }
            
                if (String(window.getConfig?.().staging).toLowerCase()==="true") {
                    const editorScript = document.createElement("script");
                    editorScript.src = "/content/xpmlite/js/dxa-inline-BgHCj97B.js";
                    editorScript.defer = true;
                    document.head.appendChild(editorScript);
                    
                    const dxaXpmliteScript = document.createElement("script");
                    dxaXpmliteScript.src = "/content/xpmlite/js/dxa-xpmlite-5uCZb9VB.js";
                    editorScript.defer = true;
                    document.head.appendChild(dxaXpmliteScript);
                }
            </script>
        }
            
    </body>
    </html>
```

#### 5. Inject the Root DOM Element

- Add the following target container markup within the <body> of your website's layout page:

```html
    <div id="xpmlite"></div>
```

## 2. Access Management Configuration

- Configure Tridion Access Management to authenticate the XPM Lite application.

    1. Register the Application: In the Access Management UI, register a new application (e.g., xpmlite).
   
    2. Configure Flow & URIs:
   
        - Provide a Name.
        
        - Define the Redirect URLs.
        
        - Set the Allowed Authentication Flow Type to AuthorizationCode.
    
    3. Capture Client ID: Copy the generated Client ID for use in the website configuration. 
    
    4. Enable Identity Provider: Check the box to enable the XPM Lite application within your configured Identity Provider (IdP).

## 3. Configuration

### DXA Website Configuration (Web.config)

- Update the <appSettings> and custom configuration sections in your DXA website's root Web.config file (<%WEBSITE_ROOT%>\Web.config).
  
    ```xml
        <configuration>
            <configSections>
                <section name="PageTypeImageSection" type="netfw48.App_Start.PageTypeImagesConfigSection"/>
            </configSections>

             <appSettings>
                <!-- Start XPMLITE --> 
                <add key="client_id" value="**" />
                <add key="redirect_uri" value="**" />
                <add key="openapi_baseurl" value="https://*****/api/v3.0" />
                <add key="authorization_baseurl" value="https://*****/access-management/connect" />
                <add key="contentServiceUrl" value="https://******:8081/cd/api" />
                <add key="experience_space_url" value="https://******/ui/editor" />
                <!-- End XPMLITE -->
            </appSettings>
            .....

            <PageTypeImageSection>
                <PageTypeImages>
                    <add key="1" publicationID="5" pageTitle="Home" path="/content/xpmlite/img/template.png"></add>
                    <add key="2" publicationID="7" pageTitle="Products" path="/content/xpmlite/img/ProductsPage.png"></add>
                    <add key="3" publicationID="7" pageTitle="Product Offerings(dynamic)" path="/content/xpmlite/img/ProductsPage.png"></add>
                    <add key="4" publicationID="7" pageTitle="Product Offerings" path="/content/xpmlite/img/ProductsPage.png"></add>
                    <add key="5" publicationID="7" pageTitle="Products Details page" path="/content/xpmlite/img/ProductsPage.png"></add>
                    <add key="6" publicationID="7" pageTitle="Offerings Campaign" path="/content/xpmlite/img/OfferingsCampaign.png"></add>
                    <add key="7" publicationID="7" pageTitle="Offerings Campaign Page(dynamic)" path="/content/xpmlite/img/OfferingsCampaign.png"></add>
                    <add key="8" publicationID="5" pageTitle="Article Page" path="/content/xpmlite/img/Articles.jpg"></add>
                    <add key="9" publicationID="5" pageTitle="News Article Page" path="/content/xpmlite/img/News.jpg"></add>
                    <add key="10" publicationID="5" pageTitle="Accordion Page" path="/content/xpmlite/img/Accordian.jpg"></add>
                    <add key="11" publicationID="5" pageTitle="Dynamic List" path="/content/xpmlite/img/dynamic.jpg"></add>
                    <add key="12" publicationID="5" pageTitle="Gallery Page" path="/content/xpmlite/img/gallery.jpg"></add>
                    <add key="13" publicationID="5" pageTitle="Location Page" path="/content/xpmlite/img/location.jpg"></add>
                    <add key="14" publicationID="5" pageTitle="Section Page" path="/content/xpmlite/img/section.jpg"></add>
                    <add key="15" publicationID="5" pageTitle="Section Page with Carousel" path="/content/xpmlite/img/section-carousel.jpg"></add>
                    <add key="16" publicationID="5" pageTitle="Tabbed Content Page" path="/content/xpmlite/img/tabbed.jpg"></add>
                    
                    <add key="17" publicationID="7" pageTitle="Home" path="/content/xpmlite/img/template.png"></add>
                </PageTypeImages>
            </PageTypeImageSection>
        </configuration>
    ```
    | Parameter               | Description                                                                    |
    | :---------------------- | :----------------------------------------------------------------------------- |
    | `client_id`             | The unique application ID generated in Access Management.                      |
    | `redirect_uri`          | The authorized callback URL configured in Access Management.                   |
    | `openapi_baseurl`       | The base endpoint URL for the Tridion Sites Open API.                          |
    | `authorization_baseurl` | The endpoint URL for the Access Management connection token service.           |
    | `contentServiceUrl`     | The Content Delivery (CD) API Content Service endpoint URL.                    |
    | `experience_space_url`  | The root URL of the Tridion Sites Experience Space interface.                  |
    | `publicationID`         | The target Tridion Sites Publication ID.                                       |
    | `pageTitle`             | The corresponding Page Type title matching the Content Manager.                |
    | `path`                  | The web-relative path to the custom thumbnail image used during page creation. |
    
### Content Manager Prerequisite Structure Groups

- Ensure your Blueprinting and Structure Groups are organized with the following hierarchy to enable page creation capabilities:

  - Home Structure Group:
    
    - _Page Types Structure Group (Must contain the page types/prototypes required for users to create new pages).

### Enable Open API Cross-Origin Resource Sharing (CORS)
  
- To allow the website to communicate with the Tridion Sites Open API across domains, explicitly add your DXA website's origin to the Open API service's Web.config 
  (<%TRIDION_HOME%>\openapi\service\Web.config):
  
```xml
    <corsConfigs>
        <corsAllowlist>
        <!-- To enable CORS you can add multiple lines like the one below and put your custom web-site domain and port. -->
        <!-- <add origin="https://domain:port" /> -->
        </corsAllowlist>
  </corsConfigs>
```


## 4. User Guide & Features

### Accessing the Tool

  - Navigate to your DXA website in a web browser.
  
  - An absolute-positioned tool bar will render at the bottom of the viewport.
  
  - Click the login button, then enter your Tridion Sites Content Manager credentials.

### Inline Editing

- Modify Content: Double-click on editable text or images directly on the webpage. An input control will appear. Edit the value and click Save to send the update directly to the Content Manager.

- Publishing: After saving your modifications, click the Publish button located in the bottom toolbar to publish the new changes.

### Component Presentation Management

- Click Page Info in the bottom toolbar to open the current page component presentation.
  
  - Inserting a Component:
   
    1. Select the specific page Region where the new component should live.
    
    2. Click the Plus (+) icon located above the Page Info bar.
    
    3. Select the desired component using the Item Selector pop-up modal, then click Insert.
    
    4. Click the Save button adjacent to the Plus icon, then select Publish.
   
  - Removing a Component:
    1. Select the targeted component from the page info.
    
    2. Click the Delete button.
    
    3. Click Save and then Publish to commit the changes.

### Creating New Pages

- Click the Create New Page button on the bottom control bar.

- Select your desired page type from the Page Types modal window and click Next.

- Fill out the mandatory metadata fields (e.g., Page Name and Page Filename) and click Next.

- Review the page component presentation details, then click Next to finalize page creation.

- Click Publish to make it active online.

- The system will automatically redirect and open your newly created page. 
