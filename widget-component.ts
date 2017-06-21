/**
* Widget settings including event callbacks
*/
class WidgetComponent {

    public id: number;

    constructor(public name: string) { }

    /**
    * setup initial state of widget
    * @param element    The html element the widget is attached to
    */
    public setupWidget: (element: Element) => void;

    /**
    * setup initial state of widget
    * @param element    The html element the widget is attached to
    */
    public removeWidget: (element: Element) => void;

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
    public static get Instance(): WidgetManager {
        return this._instance || (this._instance = new this());
    }

    // registry of widgets on a page
    private _lastWidgetID: number;
    public Widgets: Array<WidgetComponent>
    private _lastInstanceID: number;
    public Instances: Array<WidgetInstance>

    // private constructor to enforce singleton
    private constructor() {
        this.Widgets = new Array<WidgetComponent>();
        this.Instances = new Array<WidgetInstance>();
        this._lastWidgetID = 0;
        this._lastInstanceID = 0;
    }

    /**
     * Register a widget with the manager.
     * @param widget    the widget to register.
     */
    public registerWidget(widget: WidgetComponent): void {
        this._lastWidgetID++;
        widget.id = this._lastWidgetID;
        this.Widgets.push(widget);
    }

    /**
     * Create an instance of a widget.
     * @param widget    the widget to register.
     */
    public createWidget(element: Element, widgetName: string): WidgetInstance {

        // create new instance
        this._lastInstanceID++;
        var widget = this.Widgets.filter(w => w.name === widgetName)[0];
        var instance = new WidgetInstance(this._lastInstanceID, widget, element);
        this.Instances.push(instance);

        // fire initialisation events
        instance.widgetType.setupWidget(element);
        instance.widgetType.loadData(element);

        return instance;
    }

    /**
     * Refresh data of all widgets registered.
     */
    public refreshWidgets(): void {
        this.Instances.forEach((i: WidgetInstance) => {
            i.widgetType.loadData(i.element);
        });
    }

    /**
     * Return layout of all widgets registered with manager.
     */
    public getLayout(): string {
        var widgetsInfo = []
        this.Instances.forEach((i: WidgetInstance) => {

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

    // layout
    private _layout: Array<{
        name: string,
        x: string,
        y: string,
        width: string,
        height: string
    }> = [];

    public saveLayout() {

        console.log('layout saving');

        this._layout.length = 0; // todo: best way of clearing an array ?

        this.Instances.forEach((i: WidgetInstance) => {

            var widgetContainer = i.element.parentElement;
            var widgetElement = widgetContainer.parentElement;

            this._layout.push({
                name: i.widgetType.name,
                x: widgetElement.getAttribute('data-gs-x').valueOf(),
                y: widgetElement.getAttribute('data-gs-y').valueOf(),
                width: widgetElement.getAttribute('data-gs-width').valueOf(),
                height: widgetElement.getAttribute('data-gs-height').valueOf()
            });
                                    
        });


        console.log('layout saved');
        console.log(this._layout);

    }

    public loadLayout(): Array<{name: string, x: string, y: string, width: string, height: string }> {
        return this._layout;
    }

    // pub/sub hub
    private _subscribers: { [id: string]: Array<WidgetDelegate> } = {}; // todo: should it be an any for messgae?

    /**
    * Register a subscriber to an event
    * @param eventName    the name of the event to subscribe to
    * @param callback    the method to invoke when the event occurs
    */
    public registerSubscriber(eventName: string, delegate: WidgetDelegate) {

        console.log('registering ' + eventName);

        var eventNameLower = eventName.toLowerCase();

        if (this._subscribers[eventNameLower] == null) { // todo: using == supports null and nothing - best way?
            this._subscribers[eventNameLower] = [];
        }

        // todo: prevent double subscription ? - v2
        this._subscribers[eventNameLower].push(delegate);

        console.log('registered ' + eventName);

    }

    /**
    * Unregister a subscriber to an event
    * @param eventName    the name of the event to subscribe to
    * @param callback    the method to invoke when the event occurs
    */
    public unregisterSubscriber(eventName: string, delegate: WidgetDelegate) {

        console.log('unregistering ' + eventName);

        var eventNameLower = eventName.toLowerCase();

        if (this._subscribers[eventNameLower] == null) { // todo: using == supports null and nothing - best way?
            this._subscribers[eventNameLower] = [];
        }

        // todo: prevent double subscription ? - v2
        var indexOfItemToRemove = this._subscribers[eventNameLower].indexOf(delegate);
        this._subscribers[eventNameLower].splice(indexOfItemToRemove);

        console.log('unnregistered ' + eventName);

    }

    /**
    * Raise the event
    * @param eventName    the name of the event to subscribe to
    * @param message    the message to pass to the callback - todo: typed?
    */
    public raiseEvent(eventName: string, message: any) {

        var eventNameLower = eventName.toLowerCase();

        // prevent double subscription ?
        this._subscribers[eventNameLower].forEach(e => {
            try {
                e.callback(message, e.instanceElement);
            }
            catch (e) {
                console.error('error invoking subsciber for event ' + eventName);
                console.error(e);
            }
        });

    }

}

class WidgetDelegate {
    public callback: (message: any, element: Element) => void;
    public instanceElement: Element;
}