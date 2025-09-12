declare module "quill-better-table" {
  import Quill from "quill";

  export interface BetterTableOptions {
    operationMenu?: {
      items?: Record<string, boolean>;
    };
  }

  const QuillBetterTable: any;
  export default QuillBetterTable;
}
