import { MemoryRouter } from "react-router-dom";
import Login from "../../../../src/components/authentication/login/Login";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom";
import { library } from '@fortawesome/fontawesome-svg-core';
import { fab } from '@fortawesome/free-brands-svg-icons';
import { instance, mock, verify } from "@typestrong/ts-mockito";
import { LoginPresenter } from "../../../../src/presenter/LoginPresenter";

library.add(fab);

describe("Login Component", () => {
    it("starts with the sign in button disabled", () => {
        const { signInButton } = renderLoginandGetElements();
        expect(signInButton).toBeDisabled();
    });

    it("enables the sign in button if both alias and password have text", async () => {
        const { user, aliasField, passwordField, signInButton } = renderLoginandGetElements();

        await user.type(aliasField, "a");
        await user.type(passwordField, "b");

        expect(signInButton).toBeEnabled();
    });

    it('disables the sign in button if either the alias or password field is cleared', async () => {
        const { user, aliasField, passwordField, signInButton } = renderLoginandGetElements();

        await user.type(aliasField, "a");
        await user.type(passwordField, "b");
        expect(signInButton).toBeEnabled();

        await user.clear(aliasField);
        expect(signInButton).toBeDisabled();

        await user.type(aliasField, "a");
        await user.clear(passwordField);
        expect(signInButton).toBeDisabled();
    });

    it("calls the presenter's login method when the sign in button is clicked", async () => {
        const originalUrl = "http://original-url.com";
        const alias = "test-alias";
        const password = "test-password";
        const mockPresenter = mock<LoginPresenter>();
        const mockPresenterInstance =  instance(mockPresenter);
        const { user, aliasField, passwordField, signInButton } = renderLoginandGetElements(originalUrl, mockPresenterInstance);

        await user.type(aliasField, alias);
        await user.type(passwordField, password);
        expect(signInButton).toBeEnabled();

        await user.click(signInButton);
        verify(mockPresenter.login(originalUrl)).once();
    });

});

function renderLogin(originalUrl?: string, presenter?: LoginPresenter) {
    return render(
        <MemoryRouter>
            {!!presenter ? (<Login originalUrl={originalUrl} presenter={presenter} />) : <Login originalUrl={originalUrl} />}
        </MemoryRouter>
    );
}

function renderLoginandGetElements(originalUrl?: string, presenter?: LoginPresenter) {
    const user = userEvent.setup();
    const rendered = renderLogin(originalUrl, presenter);
    const signInButton = screen.getByRole("button", { name: /Sign in/i });
    const aliasField = screen.getByLabelText("Alias");
    const passwordField = screen.getByLabelText("Password");
    return { user, aliasField, passwordField, signInButton };
}