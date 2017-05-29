/**
* Main component to be wrapped around widget element
*/
class WidgetComponent {

    /**
     * Register a widget with the manager.
     * @param element    The html element to attach the widget to.
     * @param settings    The settings including callbacks to be applied to the widget.
     */
    constructor(public element: Element, public settings: WidgetSettings) {
        settings.loadData(element);
    }

}

/**
* Widget settings including event callbacks
*/
class WidgetSettings {
    public loadData: (element: Element) => void;
}

/**
* Singleton for managing widgets on a page widgets register themselves then can be centrally managed.
*/
class WidgetManager {

    // singleton implementation
    private static _instance: WidgetManager;

    private constructor() {
        this._widgets = new Array<WidgetComponent>();
    }

    /**
     * Singleton property
     */
    public static get Instance() : WidgetManager {
        return this._instance || (this._instance = new this());
    }
    
    // registry of widgets on a page
    private _widgets: Array<WidgetComponent>
    
    /**
     * Register a widget with the manager.
     * @param widget    the widget to register.
     */
    public registerWidget(widget: WidgetComponent): void {
        this._widgets.push(widget);
    }

    /**
     * Refresh data of all widgets registered.
     */
    public refreshWidgets(): void {
        this._widgets.forEach((w: WidgetComponent) => {
            w.settings.loadData(w.element);
        });
    }

    /**
     * Return layout of all widgets registered with manager.
     */
    public getLayout(): string {
        var widgetsInfo = []
        this._widgets.forEach((w: WidgetComponent) => {

            var e = w.element.parentElement.parentElement;
            var id = w.element.id;
            var x = e.getAttribute('data-gs-x').valueOf();
            var y = e.getAttribute('data-gs-y').valueOf();
            var width = e.getAttribute('data-gs-width').valueOf();
            var height = e.getAttribute('data-gs-height').valueOf();

            widgetsInfo.push("id:" + id + ";x:" + x + ";y:" + y + ";width:" + width + ";height:" + height);

        });
        return widgetsInfo.join(",");
    }
    
}