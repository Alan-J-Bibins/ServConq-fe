import { redirect, type LoaderFunctionArgs } from "react-router"

export const loader = async ({ params }: LoaderFunctionArgs) => {
    const centerId = params.centerId;
    return redirect(`/center/${centerId}/configure`);
}
