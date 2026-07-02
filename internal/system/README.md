# Content warning prescreen

`safety_prescreen.html` displays the notices that users review before opening a resource with content or technical warnings.

## Content warning codes

| Code | Warning | Use it when the resource... |
| --- | --- | --- |
| `01` | Online interaction | lets users communicate, play, or otherwise interact with other people. |
| `02` | External service | is operated by a named third party whose own terms or privacy rules apply. |
| `03` | High resource usage | may use substantial CPU, GPU, or memory and could perform poorly on older devices. |
| `04` | Photosensitivity | contains flashing lights, repeated flashes, or rapidly changing high-contrast patterns. |
| `05` | Disturbing content | contains horror, jumpscares, frightening imagery, or other potentially upsetting material. |
| `06` | Mature language | contains strong language or adult themes. |
| `07` | User-created content | displays user-created content that is not actively moderated by StudyBase. |
| `08` | Device heat and battery | can place a sustained load on the device, causing heat or unusually fast battery drain. |

Use every code that genuinely applies. For example, a resource with flashing horror content should use `types=04,05`. Codes `03` and `08` may be used together when a resource is both demanding and likely to heat the device.

## Adding a warned resource

Wrap the real resource URL with the safety prescreen URL in the API catalogue:

```js
{
  name: "-v-Example Resource",
  iconurl: "/assets/images/resource-icons/example.jpg",
  url: "/internal/system/safety_prescreen.html?types=04,05&name=Example%20Resource&provider=Example%20Provider&url=https%3A%2F%2Fexample.com%2Fembed",
  openInNewTab: false,
},
```

Parameters:

| Parameter | Required | Meaning |
| --- | --- | --- |
| `types` | Yes | Comma-separated warning codes with no spaces. |
| `name` | Yes | The resource name shown to the user. |
| `provider` | No | The external provider name, when there is one. |
| `url` | Yes | The complete destination URL, percent-encoded so its own query parameters cannot alter the prescreen URL. |

Generate the wrapped path in JavaScript when practical to avoid encoding mistakes:

```js
const params = new URLSearchParams({
  types: "04,05",
  name: "Example Resource",
  provider: "Example Provider",
  url: "https://example.com/embed",
});

const resourceUrl = `/internal/system/safety_prescreen.html?${params}`;
```

Before uploading a resource, open it and check the content yourself. Add only relevant warnings; warning labels are not a replacement for deciding whether the resource is suitable for StudyBase.

When introducing a new warning code, update both the `warningData` object in `safety_prescreen.html` and the table in this README.
