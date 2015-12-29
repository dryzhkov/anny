import _ from 'lodash'
import Layer from './Layer'
import ERROR from './Error'
import {type} from './Util'
import validate from './Validate'

/**
 * A Network contains [Layers]{@link Layer} of [Neurons]{@link Neuron}.
 *
 * @example
 * // 2 inputs
 * // 1 output
 * const net = new Network([2, 1]);
 *
 * @example
 * // 16 inputs
 * // 10 neuron hidden layer
 * // 4 neuron hidden layer
 * // 1 output
 * const net = new Network([16, 10, 4, 1]);
 */
class Network {
  /**
   * Creates a Network of Layers consisting of Neurons. Each array element
   * indicates a layer.  The value indicates the number of Neurons in that
   * Layer.
   *
   * The first element represents the number of Neurons in the input Layer.
   * The last element represents the number of Neurons in the output Layer.
   * Each element in between represents a hidden Layer with n Neurons.
   * @param {number[]} layerSizes - Number of neurons in each layer.
   * @constructor
   * @see Layer
   * @see Neuron
   */
  constructor(layerSizes) {
    if (!_.isArray(layerSizes)) {
      throw new Error(
        `Network() \`layerSizes\` must be an array, not: ${type(layerSizes)}`
      )
    }

    if (_.isEmpty(layerSizes) || !_.every(layerSizes, _.isNumber)) {
      throw new Error(
        `Network() \`layerSizes\` array elements must be all numbers.`
      )
    }

    /**
     * The output values of the Neurons in the last layer.  This is identical to
     * the Network's `outputLayer` output.
     * @type {Array}
     */
    this.output = []

    /**
     * The result of the `errorFn`.  Initializes as `null`.
     * @type {null|number}
     */
    this.error = null

    /**
     * An array of all Layers in the Network.  It is a single dimension array
     * containing the `inputLayer`, `hiddenLayers`, and the `outputLayer`.
     * @type {Layer}
     */
    this.allLayers = _.map(layerSizes, size => new Layer(size))
    /**
     * The first Layer of the Network.  This Layer receives input during
     * activation.
     * @type {Layer}
     */
    this.inputLayer = _.first(this.allLayers)

    /**
     * An array of all layers between the `inputLayer` and `outputLayer`.
     * @type {Layer[]}
     */
    this.hiddenLayers = _.slice(this.allLayers, 1, this.allLayers.length - 1)

    /**
     * The last Layer of the Network.  The output of this Layer is the
     * "prediction" the Network has made for some given input.
     * @type {Layer}
     */
    this.outputLayer = _.last(this.allLayers)

    // connect layers
    _.each(this.allLayers, (layer, i) => {
      const next = this.allLayers[i + 1]
      if (next) layer.connect(next)
    })
  }

  /**
   * Activate the network with a given set of `input` values.
   * @param {number[]} inputs - Values to activate the Network input Neurons.
   *   Values should be normalized between -1 and 1 using Util.normalize.
   * @returns {number[]} output values
   */
  activate(inputs) {
    this.inputLayer.activate(inputs)
    _.invoke(this.hiddenLayers, 'activate')
    this.output = this.outputLayer.activate()
    return this.output
  }

  /**
   * Correct the Network to produce the specified `output`.
   * @param {number[]} output - The target output for the Network.
   * Values in the array specify the target output of the Neuron in the output
   *   layer.
   */
  correct(output) {
    this.outputLayer.train(output)

    // train hidden layers in reverse (last to first)
    for (let i = this.hiddenLayers.length - 1; i >= 0; i -= 1) {
      this.hiddenLayers[i].train()
    }

    this.inputLayer.train()
  }
}

export default Network
