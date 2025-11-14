import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/_unauthenticated")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className="relative isolate flex min-h-screen w-full flex-col items-center justify-center overflow-hidden">
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1444664361762-afba083a4d77?q=80&w=2000&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D')",
        }}
      />
      <div className="absolute inset-0 overflow-hidden">
        <span className="absolute top-0 w-full select-none whitespace-nowrap text-center text-[4rem] font-extrabold text-white opacity-[0.02] sm:text-[8rem] md:text-[12rem] lg:text-[17rem]">
          YOUR
        </span>
        <span className="absolute bottom-0 w-full select-none whitespace-nowrap text-center text-[4rem] font-extrabold text-white opacity-[0.02] sm:text-[8rem] md:text-[12rem] lg:text-[17rem]">
          APP
        </span>
      </div>
      <div className="relative z-10 flex min-h-[85vh] w-full max-w-[95%] items-center justify-center overflow-hidden rounded-xl md:min-h-[70vh] md:max-w-[80%] md:rounded-3xl">
        <div className="flex w-full flex-col items-center justify-center px-4 text-center md:px-8">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
