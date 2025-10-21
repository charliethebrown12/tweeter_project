import { anything, instance, mock, verify, spy, when, capture } from '@typestrong/ts-mockito';
import { AuthToken } from 'tweeter-shared';
import { NavbarPresenter, NavbarView } from '../../src/presenter/NavbarPresenter';
import { UserService } from '../../src/model.service/UserService';

describe('NavbarPresenter', () => {
    let mockNavbarView: NavbarView;
    let mockNavbarPresenter: NavbarPresenter;
    let mockService: UserService;
    const authToken = new AuthToken('test-token', Date.now());

    beforeEach(() => {
        mockNavbarView = mock<NavbarView>();
        const mockNavbarPresenterInstance = instance(mockNavbarView);

        const NavbarPresenterSpy = spy(new NavbarPresenter(mockNavbarPresenterInstance));
        when((mockNavbarView).displayInfoMessage(anything(), 0)).thenReturn("messageID123");
        mockNavbarPresenter = instance(NavbarPresenterSpy);
        mockService = mock<UserService>();

        when(NavbarPresenterSpy.service).thenReturn(instance(mockService));
    })

    it('tells the view to display a logging out message', async () => {
        await mockNavbarPresenter.logout(authToken);
        verify(mockNavbarView.displayInfoMessage(anything(), 0)).once();
    })

    it('calls logout on the user service with the correct auth token', async () => {
        await mockNavbarPresenter.logout(authToken);
        verify(mockService.logout(authToken)).once();
    })

    it('tells the view to clear the info message that was displayed previously, clear the user info, and navigate to the login page when successful', async () => {
        await mockNavbarPresenter.logout(authToken);
        verify(mockNavbarView.deleteMessage("messageID123")).once();
        verify(mockNavbarView.onLogoutSuccess()).once();
        verify(mockNavbarView.displayErrorMessage(anything())).never();
    })

    it(' tells the view to display an error message and does not tell it to clear the info message, clear the user info or navigate to the login page when unsuccessful', async () => {
        let error = new Error('Logout failed');
        when(mockService.logout(anything())).thenThrow(error);

        await mockNavbarPresenter.logout(authToken);

        verify(mockNavbarView.displayErrorMessage(`Failed to logout because of exception: Logout failed`)).once();
        verify(mockNavbarView.deleteMessage(anything())).never();
        verify(mockNavbarView.onLogoutSuccess()).never();
    })
});
