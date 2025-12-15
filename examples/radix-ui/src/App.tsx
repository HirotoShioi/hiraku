import { DeclarativeDemo } from "./components/examples/hooks";
import { ImperativeDemo } from "./components/examples/modal";
import "./index.css";
import { ModalProvider } from "@hirotoshioi/hiraku-radix-ui";

function App() {
	return (
		<div className="flex min-h-screen items-center justify-center bg-background px-6 py-10 text-foreground">
			<div className="w-full max-w-2xl space-y-6 rounded-2xl border bg-card p-8 shadow-sm">
				<div className="space-y-2">
					<p className="text-sm text-muted-foreground">
						shadcn/ui + Tailwind CSS v4
					</p>
					<h1 className="text-3xl font-semibold tracking-tight">
						Modal component samples
					</h1>
				</div>

				<ImperativeDemo />
				<DeclarativeDemo />
			</div>

			<ModalProvider />
		</div>
	);
}

export default App;
