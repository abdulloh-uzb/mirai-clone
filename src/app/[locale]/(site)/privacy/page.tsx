import { contentRoute } from "@/components/content/content-page";

const route = contentRoute("privacy");

export const generateMetadata = route.generateMetadata;
export default route.Page;
