import { List, Modal } from "@react95/core";

function CharacterModal(props: any) {
    return (
      <Modal
        width="300"
        height="auto"
        icon={props.icon}
        title={props.title}
        defaultPosition={{x: props.posish[0], y: props.posish[1]}}
        closeModal={props.clickFunc}
        // buttons={[{
        //   value: 'Ok',
        //   onClick: props.clickFunc
        // }]}
        menu={[{
          name: 'Menu',
          list: <List>
            <List.Item onClick={props.toggleFunc}>Toggle Mode</List.Item>
          </List>
        }]}
      >{props.bio}</Modal>
    );
  }

  export default CharacterModal;