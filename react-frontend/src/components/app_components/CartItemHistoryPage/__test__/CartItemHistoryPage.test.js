import React from "react";
import { render, screen } from "@testing-library/react";

import CartItemHistoryPage from "../CartItemHistoryPage";
import { MemoryRouter } from "react-router-dom";
import "@testing-library/jest-dom";
import { init } from "@rematch/core";
import { Provider } from "react-redux";
import * as models from "../../../models";

test("renders cartItemHistory page", async () => {
    const store = init({ models });
    render(
        <Provider store={store}>
            <MemoryRouter>
                <CartItemHistoryPage />
            </MemoryRouter>
        </Provider>
    );
    expect(screen.getByRole("cartItemHistory-datatable")).toBeInTheDocument();
    expect(screen.getByRole("cartItemHistory-add-button")).toBeInTheDocument();
});
