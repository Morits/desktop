import { Pipe, PipeTransform } from '@angular/core';

/*
 * Transform shortcut modifiers to icons
 * Usage:
 *   value
 * Example:
 *   {{ 'CommandOrControl+Alt+L' | shortcut }}
 *   formats to:
 *      ⌘+⌥+L on Macs
 *      Ctrl+Alt+L on Windows or Linux
*/
@Pipe({name: 'shortcut'})
export class ShortcutPipe implements PipeTransform {
    private readonly translations: {[key: string]: {[key: string]: string}} = {
        darwin: {
            CommandOrControl: '⌘',
            CmdOrCtrl: '⌘',
            Command: '⌘',
            Cmd: '⌘',
            Ctrl: '⌃',
            Control: '⌃',
            Alt: '⌥',
            Shift: '⇧',
            Backspace: '⌫',
        },
        win32: {
            CommandOrControl: 'Ctrl',
            CmdOrCtrl: 'Ctrl',
        },
        linux: {
            CommandOrControl: 'Ctrl',
            CmdOrCtrl: 'Ctrl',
        },
    };
    transform(value: { [key: string]: string }): string {
        const transformedComponents: string[] = [];
        const components = value.accelerator.split('+');
        components.forEach((component, i) => {
            if (i === components.length - 1)
                component = value.keyPressed;

            transformedComponents.push(
                this.translations[process.platform] && this.translations[process.platform][component] ?
                    this.translations[process.platform][component] : component);
        });
        return transformedComponents.join('+');
    }
}
