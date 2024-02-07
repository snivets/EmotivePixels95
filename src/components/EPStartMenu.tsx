import { List, TaskBar } from "@react95/core";

import nateImg from '../assets/DiscoNate.jpg';
import craigImg from '../assets/DiscoCraig.jpg';
import willImg from '../assets/DiscoWill.jpg';
import paulyImg from '../assets/DiscoPaul.jpg';
import * as strings from '../text/Strings.ts';

// Props: open (state), open, funcs for each person's dialog
function EPStartMenu(props: any) {
    return (
      <TaskBar list={<List>
        <List.Item
          icon={<img src={nateImg} width={32} />}
          onClick={props.nateModal} >
          {strings.NATE_TITLE}
        </List.Item>
        <List.Item
          icon={<img src={craigImg} width={32} />}
          onClick={props.craigModal} >
          {strings.CRAIG_TITLE}
        </List.Item>
        <List.Item
          icon={<img src={willImg} width={32} />}
          onClick={props.willModal} >
          {strings.WILL_TITLE}
        </List.Item>
        <List.Item
          icon={<img src={paulyImg} width={32} />}
          onClick={props.paulyModal} >
          {strings.PAULY_TITLE}
        </List.Item>
      </List>} />
    );
  }

  export default EPStartMenu;