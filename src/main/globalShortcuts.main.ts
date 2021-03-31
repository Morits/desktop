import { app, globalShortcut } from 'electron';
import { MessagingService, StorageService } from 'jslib/abstractions';
import { WindowMain } from 'jslib/electron/window.main';

export class GlobalShortcutsMain {
    private registeredAccelerators: string[] = [];

    constructor(private storageService: StorageService, private windowMain: WindowMain, private messagingService: MessagingService) {
    }

    init() {
        this.updateShortcuts();
    }

    async updateShortcuts() {
        // Unregister all registered shortcuts so they are initialized in the right order
        if (this.registeredAccelerators.length > 0) {
            this.registeredAccelerators.forEach(accelerator => {
                globalShortcut.unregister(accelerator);
            });
        }

        const shortcuts = await this.storageService.get<{[key: string]: { [key: string]: string }}>('globalShortcuts');
        if (shortcuts) {
            const orderedShortcuts: any[] = [];
            Object.keys(shortcuts).forEach(id => {
                const components = shortcuts[id].accelerator.split('+');
                orderedShortcuts.push({...shortcuts[id], id: id, componentCount: components.length});
            });

            orderedShortcuts.sort((a, b) => {
                if (a.componentCount === b.componentCount)
                    return 0;

                return a.componentCount < b.componentCount ? 1 : -1;
            });

            orderedShortcuts.forEach(shortcut => {
                if (!shortcut.accelerator)
                    return;

                this.registeredAccelerators.push(shortcut.accelerator);

                globalShortcut.register(shortcut.accelerator, async () => {
                    if (this.windowMain.win == null) {
                        this.windowMain.createWindow().then(() => {
                            this.windowMain.win.show();
                            if (process.platform === 'darwin')
                                app.dock.show();
                        });
                    }
                    else if (!this.windowMain.win.isVisible()) {
                        this.windowMain.win.hide();
                        if (process.platform === 'darwin')
                            app.dock.show();
                    }

                    this.messagingService.send(shortcut.id);
                    this.windowMain.win.show();
                });
            });
        }
    }
}
