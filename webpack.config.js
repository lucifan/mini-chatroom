module.exports = {
  watch: true,
  entry: {
  	"index": __dirname + '/public/jsx/index.jsx'
  },
  output: {
  	path: __dirname + '/public/js',
    filename: '[name].js'
  },
  module: {
  	loaders: [
  		{
  			test: /\.js[x]?$/,
  			exclude: /node_modules/,
  			loader: 'jsx'
  		},
  		{
  			test: /\.css$/,
  			loader: 'style-loader!css-loader'
  		}
  	]
  }
};