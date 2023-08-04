import {
  render,
  screen,
  configure,
  waitFor,
  cleanup,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Provider } from "react-redux";

// components
import App from "./App";
import store from "./store";

configure({ testIdAttribute: "id" });

afterEach(cleanup);

// initial testcase setup
function setup() {
  const { rerender } = render(
    <Provider store={store}>
      <App />
    </Provider>
  );
  const user = userEvent.setup();

  const contentInput = screen.getByPlaceholderText("Enter Todo eg:car wash...");
  const titleInput = screen.getByPlaceholderText(/enter title here.../i);
  const listItems = screen.getAllByRole("listitem");
  const addButton = screen.getByRole("button", { name: "Add" });

  return { user, titleInput, contentInput, listItems, addButton, rerender };
}

function initialCheck(listItems, titleInput, contentInput) {
  expect(listItems).toHaveLength(3);
  expect(titleInput).toHaveValue("");
  expect(contentInput).toHaveValue("");
}
function getErrorMessages() {
  const titleErrorMessage = screen.queryByTestId("titleBlock");
  const contentErrorMessage = screen.queryByTestId("contentBlock");
  return { titleErrorMessage, contentErrorMessage };
}

// testcase begins
test("Initial render check", () => {
  const { listItems, titleInput, contentInput } = setup();

  initialCheck(listItems, titleInput, contentInput);
  // default title check
  const title = screen.getByText(/Todo app/i);
  expect(title).toBeInTheDocument();
});

test("Negative scenario 1-No values", async () => {
  const { user, addButton, listItems, titleInput, contentInput } = setup();

  await user.click(addButton);
  initialCheck(listItems, titleInput, contentInput);

  // check error message is shown right
  const { titleErrorMessage, contentErrorMessage } = getErrorMessages();
  expect(titleErrorMessage).toBeVisible();
  expect(titleErrorMessage).toHaveTextContent("Title is Required");
  expect(contentErrorMessage).toBeVisible();
  expect(contentErrorMessage).toHaveTextContent("Content is Required");
});

test("Delete based on id", async () => {
  const { user } = setup();
  const deleteBtn = screen.getByTestId("del-1");
  await user.click(deleteBtn);
  await waitFor(async () => {
    const items = await screen.findAllByRole("listitem");
    expect(items).toHaveLength(2);
  });
});

test("valid values & add todo", async () => {
  const { user, addButton, titleInput, contentInput } = setup();
  await user.type(titleInput, "My Title");
  await user.type(contentInput, "My First Content");
  await user.click(addButton);
  // error not to be shown
  const { titleErrorMessage, contentErrorMessage } = getErrorMessages();
  expect(titleErrorMessage).not.toBe(true);
  expect(contentErrorMessage).not.toBe(true);
  // list count increases by 1
  const listelements = await screen.findAllByRole("listitem");
  expect(listelements).toHaveLength(3);
});

test("Negative scenario 2-Invalid values", async () => {
  const { user, addButton, listItems, titleInput, contentInput } = setup();
  const testInputs = {
    it: "atleast 3 characters",
    "This text contains maximum of 33 characters for testing purpose":
      "atmost 32 characters",
  };

  Object.keys(testInputs).map(async (input) => {
    await user.type(titleInput, input);
    await user.type(contentInput, input);
    await user.click(addButton);

    // check error message is shown right
    const { titleErrorMessage, contentErrorMessage } = getErrorMessages();
    expect(titleErrorMessage).toBeVisible();
    expect(titleErrorMessage).toHaveTextContent(
      `Title should contain ${testInputs[input]}`
    );
    expect(contentErrorMessage).toBeVisible();
    expect(contentErrorMessage).toHaveTextContent(
      `Content should contain ${testInputs[input]}`
    );
    expect(listItems).toHaveLength(3);
  });
});
