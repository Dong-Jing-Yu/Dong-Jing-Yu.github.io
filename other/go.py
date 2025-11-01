command_block_X = -8
command_block_Y = 4
command_block_Z = -17

def command_block(cmd: str, Number: int):
    row_length = 16
    layer_size = row_length * row_length

    layer = Number // layer_size
    num_in_layer = Number % layer_size

    reverse_x = layer % 2 == 1
    turn_facing = "east" if layer % 2 == 0 else "west"

    pair_index = num_in_layer // (2 * row_length)
    offset_in_pair = num_in_layer % (2 * row_length)

    # 计算 base_x/z 起点
    def last_block_pos(layer_idx):
        prev_reverse = layer_idx % 2 == 1
        pair_index = (layer_size - 1) // (2 * row_length)
        offset_in_pair = (layer_size - 1) % (2 * row_length)

        x = command_block_X + pair_index * 2
        if offset_in_pair >= row_length:
            x += 1
        if prev_reverse:
            x = command_block_X + (row_length - 1) - (x - command_block_X)

        if offset_in_pair < row_length:
            z = command_block_Z - offset_in_pair
        else:
            z = command_block_Z - (row_length - 1) + (offset_in_pair - row_length)

        return x, z

    if layer == 0:
        base_x, base_z = command_block_X, command_block_Z
    else:
        base_x, base_z = last_block_pos(layer - 1)

    x_offset = pair_index * 2 + (1 if offset_in_pair >= row_length else 0)
    x = base_x + x_offset if not reverse_x else base_x - x_offset

    if offset_in_pair < row_length:
        z = base_z - offset_in_pair
        facing = "north"
    else:
        z = base_z - (row_length - 1) + (offset_in_pair - row_length)
        facing = "south"

    # 行尾：换方向（east/west 交替）
    if offset_in_pair in [row_length - 1, 2 * row_length - 1]:
        facing = turn_facing

    # 最后一格：朝向 up
    if num_in_layer == layer_size - 1:
        facing = "up"

    y = command_block_Y + layer

    # 设置方块类型
    if Number == 0:
        block_id = "command_block"
    else:
        block_id = "chain_command_block"
    block_id = "command_block"
    # chain 的 NBT：auto=1b 保持开启
    #nbt_auto = ",auto:1b" if block_id == "chain_command_block" else ""
    nbt_auto = ""

    return f'setblock {x} {y} {z} minecraft:{block_id}[facing={facing}]{{Command:"{cmd}"{nbt_auto}}} replace'



with open('commands.mcfunction', 'w') as f:
    for i in range(0, 1):
        f.write(f'{command_block(f"particleex image minecraft:end_rod -10 5 20 {i}.png 0.1 0 0 0 horizontally 10 0 0 0 1",i)}\n')