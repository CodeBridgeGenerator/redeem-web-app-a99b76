import React from "react";
import { render, screen } from "@testing-library/react";

import CartItemHistoryEditDialogComponent from "../CartItemHistoryEditDialogComponent";
import { MemoryRouter } from "react-router-dom";
import "@testing-library/jest-dom";
import { init } from "@rematch/core";
import { Provider } from "react-redux";
import * as models from "../../../models";

test("renders cartItemHistory edit dialog", async () => {
  const store = init({ models });
  render(
    <Provider store={store}>
      <MemoryRouter>
        <CartItemHistoryEditDialogComponent show={true} />
      </MemoryRouter>
    </Provider>,
  );
  expect(
    screen.getByRole("cartItemHistory-edit-dialog-component"),
  ).toBeInTheDocument();
});
