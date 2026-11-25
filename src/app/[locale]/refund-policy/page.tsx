import { contentRoute } from "@/components/content/content-page";

const route = contentRoute("refund-policy");

export const generateMetadata = route.generateMetadata;
export default route.Page;
