import { Pagination } from "./pagination";

const meta = {
  title: "Components/Pagination",
  component: Pagination,
  parameters: {
    layout: "centered",
  },
} satisfies {
  title: string;
  component: typeof Pagination;
  parameters?: Record<string, unknown>;
};

export default meta;

export const FirstPage = () => (
  <Pagination totalCount={60} pageSize={10} currentPage={1} basePath="/examples" />
);

export const MiddlePage = () => (
  <Pagination totalCount={60} pageSize={10} currentPage={3} basePath="/examples" />
);

export const LastPage = () => (
  <Pagination totalCount={60} pageSize={10} currentPage={6} basePath="/examples" />
);
