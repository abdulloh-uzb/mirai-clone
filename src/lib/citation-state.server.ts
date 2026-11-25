import "server-only";
import { cookies } from "next/headers";
import { parseTicketState, TICKET_STATE_COOKIE } from "./citation-state";

/** The Citation state the visitor chose, from the cookie. */
export async function getTicketState(): Promise<string> {
  return parseTicketState((await cookies()).get(TICKET_STATE_COOKIE)?.value);
}
