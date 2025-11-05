import { useLoaderData, type LoaderFunctionArgs } from "react-router"
import { getUserToken } from "~/utils/helpers"

export const loader = async ({ request }: LoaderFunctionArgs) => {
    const userToken = getUserToken(request);
    //this is the user's token, you need to pass this along with the fetch call to the backend otherwise the call wont work

    // get the logs here using `await fetch()`
    // refer to other loaders if you want

    // Dummy array, after the backend call you'll have an array like this
    const logs: Log[] = [];

    // Here we are giving the data we got from the loader onto the page
    // Essentially loaders get the data before the page loads so we need to give the data to the page for it to use
    return { logs: logs }
}

export default function Page() {
    const { logs } = useLoaderData<typeof loader>() //here we are accepting the logs that we got from loader
    return (
        <div>Logs Section</div>
    )
}

