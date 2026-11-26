// Composition root. Wires engine, game, render and ui together (see docs/architecture.md).
import "./style.css";
import { startApp } from "./ui/app";

startApp(document.querySelector<HTMLElement>("#app")!);
