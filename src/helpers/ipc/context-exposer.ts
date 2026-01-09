import { exposeClientsContext } from "./db/clients/clients-context";
import { exposeThemeContext } from "./theme/theme-context";
import { exposeWindowContext } from "./window/window-context";
import { exposeSystemContext } from "./system/system-context";

export default function exposeContexts() {
    exposeWindowContext();
    exposeSystemContext();
    exposeThemeContext();
    exposeClientsContext();
}
