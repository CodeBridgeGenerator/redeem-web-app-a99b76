import React from "react";
import { render, screen } from "@testing-library/react";

import VoucherPage from "../VoucherPage";
import { MemoryRouter } from "react-router-dom";
import "@testing-library/jest-dom";
import { init } from "@rematch/core";
import { Provider } from "react-redux";
import * as models from "../../../models";

test("renders voucher page", async () => {
    const store = init({ models });
    render(
        <Provider store={store}>
            <MemoryRouter>
                <VoucherPage />
            </MemoryRouter>
        </Provider>
    );
    expect(screen.getByRole("voucher-datatable")).toBeInTheDocument();
    expect(screen.getByRole("voucher-add-button")).toBeInTheDocument();
});
