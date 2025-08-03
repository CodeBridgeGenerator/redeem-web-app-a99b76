import React from "react";
import { render, screen } from "@testing-library/react";

import CartItemsPage from "../CartItemsPage";
import { MemoryRouter } from "react-router-dom";
import "@testing-library/jest-dom";
import { init } from "@rematch/core";
import { Provider } from "react-redux";
import * as models from "../../../models";

test("renders cartItems page", async () => {
  const store = init({ models });
  render(
    <Provider store={store}>
      <MemoryRouter>
        <CartItemsPage />
      </MemoryRouter>
    </Provider>,
  );
  expect(screen.getByRole("cartItems-datatable")).toBeInTheDocument();
  expect(screen.getByRole("cartItems-add-button")).toBeInTheDocument();
});
