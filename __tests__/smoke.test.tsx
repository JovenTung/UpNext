import { render } from "@testing-library/react";
import HomePage from "@/app/page";

describe("smoke", () => {
  it("renders landing page", () => {
    const { getByText } = render(<HomePage />);
    expect(getByText(/UpNext/)).toBeInTheDocument();
  });
});
