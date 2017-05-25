class WidgetComponenet {
    
    constructor(public element: Element, public settings: WidgetSettings) {
        settings.loadData(element);
    }

}

class WidgetSettings {
    public loadData: (element: Element) => void;
}

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

    public RefreshWidgets(): void {
        this._widgets.forEach((w: WidgetComponenet) => {
            w.settings.loadData(w.element);
        });
    }
    
}