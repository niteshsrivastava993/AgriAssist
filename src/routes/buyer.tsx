import { createFileRoute } from "@tanstack/react-router";
import { RoleGuard } from "@/components/RoleGuard";

export const Route = createFileRoute("/buyer")({
  component: () => <RoleGuard roles={["buyer"]} />,
});
