export default function (kibana) {

  return new kibana.Plugin({

    uiExports: {
      visTypes: [
        'plugins/captures_vis/captures_vis'
      ]
    }

  });

}
