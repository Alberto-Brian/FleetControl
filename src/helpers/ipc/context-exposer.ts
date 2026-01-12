import { exposeClientsContext } from "./db/clients/clients-context";
import { exposeThemeContext } from "./theme/theme-context";
import { exposeWindowContext } from "./window/window-context";
import { exposeSystemContext } from "./system/system-context";
import { exposeLicenseContext } from "./license/license-context";

export default function exposeContexts() {
    exposeWindowContext();
    exposeSystemContext();
    exposeThemeContext();
    exposeClientsContext();
    exposeLicenseContext();
}
