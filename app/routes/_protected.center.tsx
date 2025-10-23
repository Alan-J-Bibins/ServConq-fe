import { Grid2x2Plus } from "lucide-react";
import { Form } from "react-router";
import CustomDialog from "~/components/Dialog";

export default function Page() {
    return (
        <main className="p-4">
            <div className="flex items-center w-full gap-2">
                <h1 className="text-3xl font-bold text-nowrap">Data Centers</h1>
                <hr className="w-full border-secondary" />
                <CustomDialog
                    title="New Datacenter"
                    trigger={
                        <button className="clickable flex justify-center gap-2 items-center text-nowrap">
                            <Grid2x2Plus />
                            New Data Center
                        </button>
                    }
                    submit={
                        <button className="clickable">
                            Submit
                        </button>
                    }
                    cancel={
                        <></>
                    }
                >
                    <Form
                        id="newDataCenterForm"
                        method="POST"
                        action="/center"
                    >
                    </Form>
                </CustomDialog>
            </div>
        </main>
    )
}

