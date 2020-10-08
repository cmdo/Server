import { Routes } from "../Routes";
import { Context } from "../Services/Context";

export type Bootstrap = (context: Context, routes: Routes) => Promise<void>;
