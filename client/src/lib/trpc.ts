import { createTRPCReact } from "@trpc/react-query";
import type { inferRouterOutputs } from "@trpc/server";
import type { AppRouter } from "../../../server/routers";

export const trpc = createTRPCReact<AppRouter>();

/** Inferred return types for every procedure, e.g. RouterOutputs["clients"]["list"]. */
export type RouterOutputs = inferRouterOutputs<AppRouter>;
