/**
* Widget settings including event callbacks
*/
class WidgetComponent {

    public id: number;

    constructor(public name: string) { }

    /**
    * call into widget to load the data
    * @param element    The html element the widget is attached to
    */
    public loadData: (element: Element) => void;

    /**
    * Save any customisation data by adding it to the array
    * @param customisation    The array of customisation items
    */
    public saveCustomisation: (customisation: { [id: string]: any }) => void;

    /**
    * Restore any customisation data by restrieving it from the array - allow for items not being present
    * @param customisation    The array of customisation items
    */
    public restoreCustomisation: (customisation: { [id: string]: any }) => void;
}

/**
* An individual instance of a widget on a dashboard
*/
class WidgetInstance {
    
    constructor(public id: number, public widgetType: WidgetComponent, public element: Element) { }
    
}

/**
* Singleton for managing widgets on a page widgets register themselves then can be centrally managed.
*/
class WidgetManager {

    // singleton implementation
    private static _instance: WidgetManager;
    
    /**
     * Singleton property
     */
    public static get Instance() : WidgetManager {
        return this._instance || (this._instance = new this());
    }
    
    // registry of widgets on a page
    private _lastWidgetID: number;
    private _widgets: Array<WidgetComponent>
    private _lastInstanceID: number;
    private _instances: Array<WidgetInstance>

    private constructor() {
        this._widgets = new Array<WidgetComponent>();
        this._instances = new Array<WidgetInstance>();
    }

    /**
     * Register a widget with the manager.
     * @param widget    the widget to register.
     */
    public registerWidget(widget: WidgetComponent): void {
        this._lastWidgetID++;
        widget.id = this._lastWidgetID;
        this._widgets.push(widget);
    }

    /**
     * Create an instance of a widget.
     * @param widget    the widget to register.
     */
    public createWidget(element: Element, widgetID: number): void {
        this._lastInstanceID++;
        var widget = this._widgets.filter(w => w.id === widgetID)[0];
        var instance = new WidgetInstance(this._lastInstanceID, widget, element);
        this._widgets.push(widget);
        instance.widgetType.loadData(element);
    }

    /**
     * Refresh data of all widgets registered.
     */
    public refreshWidgets(): void {
        this._instances.forEach((i: WidgetInstance) => {
            i.widgetType.loadData(i.element);
        });
    }

    /**
     * Return layout of all widgets registered with manager.
     */
    public getLayout(): string {
        var widgetsInfo = []
        this._instances.forEach((i: WidgetInstance) => {

            var e = i.element.parentElement.parentElement;
            var id = i.element.id;
            var x = e.getAttribute('data-gs-x').valueOf();
            var y = e.getAttribute('data-gs-y').valueOf();
            var width = e.getAttribute('data-gs-width').valueOf();
            var height = e.getAttribute('data-gs-height').valueOf();

            widgetsInfo.push("id:" + id + ";x:" + x + ";y:" + y + ";width:" + width + ";height:" + height);

        });
        return widgetsInfo.join(",");
    }
    
}