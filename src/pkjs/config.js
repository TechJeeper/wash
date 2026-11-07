module.exports = [
  {
    type: "heading",
    defaultValue: "Wash"
  },
  {
    type: "text",
    defaultValue: "Soft color fields. Huge time. One quiet caption."
  },
  {
    type: "section",
    items: [
      {
        type: "heading",
        defaultValue: "Palette"
      },
      {
        type: "select",
        messageKey: "Palette",
        label: "Palette",
        defaultValue: "harbor",
        options: [
          { label: "Harbor", value: "harbor" },
          { label: "Blush", value: "blush" },
          { label: "Night Bloom", value: "night" },
          { label: "Paper", value: "paper" },
          { label: "Ochre", value: "ochre" },
          { label: "Fog", value: "fog" },
          { label: "Acid", value: "acid" },
          { label: "Ink", value: "ink" },
          { label: "Custom", value: "custom" }
        ]
      },
      {
        type: "color",
        messageKey: "CustomBg",
        defaultValue: "0x0F2A32",
        label: "Custom background"
      },
      {
        type: "color",
        messageKey: "CustomWashA",
        defaultValue: "0x1F6F7A",
        label: "Custom wash A"
      },
      {
        type: "color",
        messageKey: "CustomWashB",
        defaultValue: "0x7EB8A2",
        label: "Custom wash B"
      },
      {
        type: "color",
        messageKey: "CustomWashC",
        defaultValue: "0x3D8EA0",
        label: "Custom wash C"
      },
      {
        type: "color",
        messageKey: "CustomFg",
        defaultValue: "0xF2F7F5",
        label: "Custom time color"
      }
    ]
  },
  {
    type: "section",
    items: [
      {
        type: "heading",
        defaultValue: "Composition"
      },
      {
        type: "select",
        messageKey: "Composition",
        label: "Layout",
        defaultValue: "cascade",
        options: [
          { label: "Cascade", value: "cascade" },
          { label: "Center bloom", value: "bloom" },
          { label: "Edge hug", value: "edge" },
          { label: "Editorial", value: "editorial" },
          { label: "Auto (hourly reflow)", value: "auto" }
        ]
      },
      {
        type: "select",
        messageKey: "FieldCount",
        label: "Wash fields",
        defaultValue: "3",
        options: [
          { label: "2", value: "2" },
          { label: "3", value: "3" },
          { label: "4", value: "4" }
        ]
      },
      {
        type: "select",
        messageKey: "Softness",
        label: "Edges",
        defaultValue: "soft",
        options: [
          { label: "Soft (halo)", value: "soft" },
          { label: "Hard", value: "hard" }
        ]
      },
      {
        type: "toggle",
        messageKey: "HourlyReflow",
        label: "Nudge composition each hour",
        defaultValue: true
      }
    ]
  },
  {
    type: "section",
    items: [
      {
        type: "heading",
        defaultValue: "Time"
      },
      {
        type: "select",
        messageKey: "FontScale",
        label: "Time style",
        defaultValue: "display",
        options: [
          { label: "Display (Roboto Bold 49)", value: "display" },
          { label: "Classic (Bitham Bold 42)", value: "condensed" },
          { label: "Compact (Bitham Black 30)", value: "bold" }
        ]
      },
      {
        type: "select",
        messageKey: "TimePlace",
        label: "Time placement",
        defaultValue: "center",
        options: [
          { label: "Center", value: "center" },
          { label: "Editorial (lower left)", value: "editorial" },
          { label: "Banner (upper)", value: "banner" }
        ]
      },
      {
        type: "select",
        messageKey: "Caption",
        label: "Caption",
        defaultValue: "date",
        options: [
          { label: "Off", value: "off" },
          { label: "Date", value: "date" },
          { label: "Weekday", value: "weekday" },
          { label: "Battery %", value: "battery" },
          { label: "Steps", value: "steps" }
        ]
      },
      {
        type: "toggle",
        messageKey: "Use24Hour",
        label: "24-hour time",
        defaultValue: true
      },
      {
        type: "toggle",
        messageKey: "LeadingZero",
        label: "Leading zero",
        defaultValue: true
      }
    ]
  },
  {
    type: "submit",
    defaultValue: "Save"
  }
];
