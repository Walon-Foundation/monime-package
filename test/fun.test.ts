import { test as sum} from "../src/index"
import { expect, test} from "vitest"

test("sum", () => {
    expect(sum("walon")).toBe("walon")
})