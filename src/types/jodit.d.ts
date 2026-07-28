declare module "jodit/es2021/jodit" {
  interface JoditStatic {
    make: (element: HTMLElement, config?: Record<string, unknown>) => {
      value: string;
      destruct: () => void;
      events: {
        on: (event: string, handler: (...args: unknown[]) => void) => void;
      };
    };
  }

  const Jodit: JoditStatic;
  export default Jodit;
  export { Jodit };
}
