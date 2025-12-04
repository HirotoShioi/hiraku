import { sampleSheetModal } from "@/components/examples/sample-sheet";
import { Button } from "@/components/ui/button";
import { useModal } from "../../../../src";

export function DeclarativeDemo() {
	const sampleSheet = useModal(sampleSheetModal);

	return (
		<div className="space-y-3 border-t pt-6">
			<h2 className="text-xl font-semibold">useModal版</h2>
			<div className="flex flex-wrap gap-3">
				<Button
					onClick={() =>
						void sampleSheet.open({
							title: "useModal版",
							description: "useSampleSheet フックでシートを開けます。",
						})
					}
				>
					シートを開く
				</Button>
				<Button
					variant="outline"
					onClick={() =>
						void sampleSheet.open({
							title: "上書きタイトル",
							description: "propsを上書きして開くこともできます",
						})
					}
				>
					props上書きで開く
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
