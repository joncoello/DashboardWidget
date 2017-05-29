// main componenet to be wrapped around widget element
class WidgetComponenet {
    
    constructor(public element: Element, public settings: WidgetSettings) {
        settings.loadData(element);
    }

}

// widget settings including event callbacks
class WidgetSettings {
    public loadData: (element: Element) => void;
}

// singleton for managing widgets on a page
// widgets register themselves then can be centrally managed
class WidgetManager {

    // singleton implementation
    private static _instance: WidgetManager;

    private constructor() {
        this._widgets = new Array<WidgetComponenet>();
    }

    public static get Instance() : WidgetManager {
        return this._instance || (this._instance = new this());
    }
    
    // registry of widgets on a page
    private _widgets: Array<WidgetComponenet>

    // add a widget to the collection
    public registerWidget(widget: WidgetComponenet): void {
        this._widgets.push(widget);
    }

    public refreshWidgets(): void {
        this._widgets.forEach((w: WidgetComponenet) => {
            w.settings.loadData(w.element);
        });
    }

    public getLayout(): string {
        var widgetsInfo = []
        this._widgets.forEach((w: WidgetComponenet) => {

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