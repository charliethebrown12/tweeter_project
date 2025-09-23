interface Props {
    id: string;
    label: string;
    placeholder: string;
    type: string;
    onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
    onKeyDown: (event: React.KeyboardEvent<HTMLElement>) => void;
}

const AuthenticationFields = () => {
  return (<div className="form-floating">
          <input
            type="text"
            className="form-control"
            size={50}
            id="aliasInput"
            placeholder="name@example.com"
            onKeyDown={loginOnEnter}
            onChange={(event) => setAlias(event.target.value)}
          />
          </div>
          );
};

export default AuthenticationFields;