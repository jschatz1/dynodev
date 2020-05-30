module Tokens
  def decoded_data(data, prop)
    index = data.index {|x| x.has_key? prop}
    if index.nil?
      index
    else
      data[index][prop]
    end
  end
end