import { contentRoute } from "@/components/content/content-page";

const route = contentRoute("terms");

export const generateMetadata = route.generateMetadata;
export default route.Page;
