# react-native-slot-text

To install dependencies:

```bash
bun install react-native-slot-text
```

This project was created using `bun init` in bun v1.1.21. [Bun](https://bun.sh) is a fast all-in-one JavaScript runtime.



https://github.com/user-attachments/assets/192d168a-6497-4035-9c8e-b39b88dabf56



## Usage

```
    <SlotText
        fontStyle={styles.animatedNumbers}
        value={`${value}`}
        prefix='$'
        animationDuration={200}
        includeComma={true}
    />
```

### Props

| Prop                | Type                  | Default  | Description                                                                                      |
|---------------------|-----------------------|----------|--------------------------------------------------------------------------------------------------|
| `value`             | '${number}'  | `N/A`    | The value to animate to. Can be a number or a string of numbers.                                  |
| `fontStyle`         | `Object`              | `N/A`    | The style of the text, passed as a `TextStyle` object.                                            |
| `animationDuration`  | `number`              | `200`    | The duration of the animation in milliseconds. Defaults to 200ms.                                 |
| `prefix`            | `string`              | `""`     | A prefix to the number, such as a currency symbol.                                                |
| `includeComma`      | `boolean`             | `false`  | Whether to include commas as thousand separators.                                                 |
