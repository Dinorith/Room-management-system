/// <reference types="vite/client" />

declare module "*.css" {
  const content: Record<string, any>;
  export default content;
}

declare module "*.scss" {
  const content: Record<string, any>;
  export default content;
}

declare module "*.sass" {
  const content: Record<string, any>;
  export default content;
}

declare module "*.less" {
  const content: Record<string, any>;
  export default content;
}

declare module "*.stylus" {
  const content: Record<string, any>;
  export default content;
}
