import _ from 'lodash';
import INITIALIZE from './Initialize';
import Neuron from './Neuron';

/**
 * Creates a single dimension Layer of Neurons.
 * @param {string} numNeurons - The number of Neurons this Layer should have.
 * @param {boolean} [addBias=false] - Add a bias Neuron to this Layer.
 * @constructor
 * @see {Neuron}
 */
class Layer {
  constructor(numNeurons, addBias) {
    this.neurons = [];

    // add neurons
    _.times(numNeurons, () => this.neurons.push(new Neuron()));

    // add bias neuron
    if (addBias) {
      let biasNeuron = new Neuron();
      biasNeuron.isBias = true;
      this.neurons.push(biasNeuron);
    }
  }

  /**
   * Connects every Neuron in this Layer to each Neuron in the `target` Layer.
   * @param {Layer} targetLayer - The Layer to connect to.
   */
  connect(targetLayer) {
    _.each(this.neurons, source => {
      // every neuron in this layer is connected to each neuron in the next.
      // we can assume the numInputs to be the num of neurons in this layer.

      // connect to each neuron in this Layer to the targetLayer
      _.each(targetLayer.neurons, target => {
        source.connect(target, INITIALIZE.weight(this.neurons.length));
      });
    });
  }

  /**
   * Activates all the Neurons in this Layer with the given array of values.
   * @param {number[]} [values] - Map of input values for each Neuron.
   * @returns {number[]} - Array of Neuron output values.
   */
  activate(values) {
    return _.map(this.neurons, (neuron, i) => {
      return neuron.activate(values ? values[i] : undefined);
    });
  }

  /**
   * Train the Neurons in this layer.  If target `outputs` are specified, the
   * Neurons will learn to output these values.  This is only useful for output
   * Layers.
   * @param {number[]} [outputs] - Map of target output values for each Neuron.
   */
  train(outputs) {
    _.each(this.neurons, (neuron, i) => {
      neuron.train(outputs ? outputs[i] : undefined);
    });
  }
}

export default Layer;
