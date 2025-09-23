import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { OverlayTrigger, Tooltip } from "react-bootstrap";
import { ToastType } from "../toaster/Toast";
import { useContext } from "react";
import { ToastActionsContext } from "../toaster/ToastContexts";
import { IconName, IconProp } from "@fortawesome/fontawesome-svg-core";

interface Props {
    oAuthProvider: string;
    id: string;
    icon: IconName;
}

const OAuth = (props: Props) => {
      const { displayToast } = useContext(ToastActionsContext);
      const displayInfoMessageWithDarkBackground = (message: string): void => {
        displayToast(ToastType.Info, message, 3000, undefined, 'text-white bg-primary');
      };
  return (
                <button
              type="button"
              className="btn btn-link btn-floating mx-1"
              onClick={() =>
                displayInfoMessageWithDarkBackground(`${props.oAuthProvider} registration is not implemented.`)
              }
            >
              <OverlayTrigger
                placement="top"
                overlay={<Tooltip id={props.id}>{props.oAuthProvider}</Tooltip>}
              >
                <FontAwesomeIcon icon={['fab', props.icon] as IconProp} />
              </OverlayTrigger>
            </button>
  );
};
export default OAuth;