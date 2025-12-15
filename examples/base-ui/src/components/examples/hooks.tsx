import { useModal } from "@hirotoshioi/hiraku-base-ui";
import { sampleSheetModal } from "@/components/examples/sample-sheet";
import { Button } from "@/components/ui/button";

export function DeclarativeDemo() {
	const sampleSheet = useModal(sampleSheetModal);

	return (
		<div className="space-y-3 border-t pt-6">
			<h2 className="text-xl font-semibold">useModal version</h2>
			<div className="flex flex-wrap gap-3">
				<Button
					onClick={() =>
						void sampleSheet.open({
							title: "useModal version",
							description: "Open the sheet via the useSampleSheet hook.",
						})
					}
				>
					Open sheet
				</Button>
				<Button
					variant="outline"
					onClick={() =>
						void sampleSheet.open({
							title: "Override title",
							description: "You can also open with overridden props.",
						})
					}
				>
					Open with overridden props
				</Button>
			</div>
			<div className="rounded-md border border-dashed bg-muted/40 px-4 py-3 text-sm text-muted-foreground space-y-1">
				<p>isOpen: {sampleSheet.isOpen ? "true" : "false"}</p>
				<p>role: {sampleSheet.role ?? "null"}</p>
				<p>
					data:{" "}
					{sampleSheet.data !== null
						? sampleSheet.data.accepted
							? "accepted ✅"
							: "not accepted ❌"
						: "null"}
				</p>
			</div>
		</div>
	);
}
