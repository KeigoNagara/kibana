import 'plugins/captures_vis/captures_vis.less';
import 'plugins/captures_vis/captures_vis_controller';
import TemplateVisTypeTemplateVisTypeProvider from 'ui/template_vis_type/template_vis_type';
import VisSchemasProvider from 'ui/vis/schemas';
import capturesVisTemplate from 'plugins/captures_vis/captures_vis.html';
import capturesVisParamsTemplate from 'plugins/captures_vis/captures_vis_params.html';
// we need to load the css ourselves

// we also need to load the controller and used by the template

// register the provider with the visTypes registry
require('ui/registry/vis_types').register(CaptureVisProvider);

function CaptureVisProvider(Private) {
  const TemplateVisType = Private(TemplateVisTypeTemplateVisTypeProvider);
  const Schemas = Private(VisSchemasProvider);

  // return the visType object, which kibana will use to display and configure new
  // Vis object of this type.
  return new TemplateVisType({
    name: 'captures',
    title: 'Captures in Timeline',
    description: 'see captures in Timeline',
    icon: 'fa-camera',
    template: capturesVisTemplate,
    params: {
      defaults: {
        handleNoResults: true,
        fontSize: 60,
        image: false
      },
      editor: capturesVisParamsTemplate
    },
    implementsRenderComplete: true,
    schemas: new Schemas([
      {
        group: 'metrics',
        name: 'metric',
        title: 'Metric',
        min: 1,
        defaults: [
          { type: 'count', schema: 'metric' }
        ]
      }
    ])
  });
}

// export the provider so that the visType can be required with Private()
export default CaptureVisProvider;
