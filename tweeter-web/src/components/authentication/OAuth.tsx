import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { OverlayTrigger, Tooltip } from 'react-bootstrap';
import { IconName, IconProp } from '@fortawesome/fontawesome-svg-core';
import { useMessageActions } from '../toaster/MessageHooks';

interface Props {
  oAuthProvider: string;
  id: string;
  icon: IconName;
}

const OAuth = (props: Props) => {
  const { displayInfoMessage } = useMessageActions();
  const displayInfoMessageWithDarkBackground = (message: string): void => {
    displayInfoMessage(message, 3000, 'text-white bg-primary');
  };
  return (
    <button
      type="button"
      className="btn btn-link btn-floating mx-1"
      onClick={() =>
        displayInfoMessageWithDarkBackground(
          `${props.oAuthProvider} registration is not implemented.`,
        )
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
